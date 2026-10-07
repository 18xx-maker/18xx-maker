import { createPool } from "#export/pool";

// A pool of fake slots, opened one after the other
const setup = (options = {}) => {
  const slots = [];
  const open = vi.fn(async () => {
    const slot = { id: slots.length, close: vi.fn(async () => {}) };
    slots.push(slot);
    return slot;
  });
  return { slots, open, pool: createPool({ open, size: 2, ...options }) };
};

describe("createPool", () => {
  it("opens slots when asked, up to its size", async () => {
    const { pool, open } = setup();

    const a = await pool.acquire();
    const b = await pool.acquire();
    expect(a).not.toBe(b);
    expect(open).toHaveBeenCalledTimes(2);

    // The third waits for a slot to be given back
    let third;
    pool.acquire().then((slot) => (third = slot));
    await Promise.resolve();
    expect(third).toBeUndefined();
    await pool.release(b);
    await vi.waitFor(() => expect(third).toBe(b));
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("reuses a slot that was given back", async () => {
    const { pool, open } = setup();

    const a = await pool.acquire();
    await pool.release(a);

    expect(await pool.acquire()).toBe(a);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("closes a slot after it was used recycleAfter times", async () => {
    const { pool, slots } = setup({ recycleAfter: 2 });

    const a = await pool.acquire();
    await pool.release(a);
    expect(a.close).not.toHaveBeenCalled();
    await pool.release(await pool.acquire());
    expect(a.close).toHaveBeenCalledTimes(1);

    // The next one is a new slot
    expect(await pool.acquire()).toBe(slots[1]);
  });

  it("closes a slot that is discarded and opens a new one for the waiting", async () => {
    const { pool, slots } = setup({ size: 1 });

    const a = await pool.acquire();
    const waiting = pool.acquire();
    await pool.release(a, { discard: true });

    expect(a.close).toHaveBeenCalledTimes(1);
    expect(await waiting).toBe(slots[1]);
  });

  it("fails the acquire when a slot can not be opened, and frees the room", async () => {
    const { pool, open } = setup({ size: 1 });
    open.mockRejectedValueOnce(new Error("no window"));

    await expect(pool.acquire()).rejects.toThrow("no window");
    expect(await pool.acquire()).toMatchObject({ id: 0 });
  });

  it("closes every slot, the busy ones too, and refuses new work", async () => {
    const { pool, slots } = setup();
    const a = await pool.acquire();
    const b = await pool.acquire();
    const third = pool.acquire();
    const failure = third.catch((error) => error.message);
    await pool.close();

    expect(b.close).toHaveBeenCalledTimes(1);
    expect(slots.every(({ close }) => close.mock.calls.length === 1)).toBe(
      true,
    );
    expect(await failure).toBe("The pool is closed");
    await expect(pool.acquire()).rejects.toThrow("pool is closed");

    // A slot that comes back after the close is already closed
    await pool.release(a);
    expect(a.close).toHaveBeenCalledTimes(1);
  });

  it("ignores a slot that fails to close", async () => {
    const { pool } = setup();
    const a = await pool.acquire();
    a.close.mockRejectedValueOnce(new Error("gone"));

    await expect(pool.release(a, { discard: true })).resolves.toBeUndefined();
  });

  it("does not hand a slot out after the pool closed while it opened", async () => {
    let finish;
    const slot = { close: vi.fn(async () => {}) };
    const pool = createPool({
      open: () => new Promise((resolve) => (finish = () => resolve(slot))),
      size: 1,
    });

    const acquired = pool.acquire();
    const closing = pool.close();
    finish();

    await expect(acquired).rejects.toThrow("pool is closed");
    await closing;
    expect(slot.close).toHaveBeenCalledTimes(1);
  });

  it("survives a slot whose close throws or returns nothing", async () => {
    let finish;
    const slot = {
      close: vi.fn(() => {
        throw new TypeError("gone");
      }),
    };
    const pool = createPool({
      open: () => new Promise((resolve) => (finish = () => resolve(slot))),
      size: 1,
    });

    const acquired = pool.acquire();
    const closing = pool.close();
    finish();

    await expect(acquired).rejects.toThrow("pool is closed");
    await closing;
    expect(slot.close).toHaveBeenCalledTimes(1);
  });
});
