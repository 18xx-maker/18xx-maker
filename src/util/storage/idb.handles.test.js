import "@tests/support/windowStub.js";

import {
  createGameFile,
  deleteGame,
  loadGame,
  loadSummaries,
  openFilePicker,
  peekGame,
  requestWrite,
  saveGameHandle,
  writeGame,
} from "@/util/storage/idb";
import { isUUID } from "#util/uuid";

// A small in-memory IndexedDB that answers requests asynchronously like the
// real one
const createIndexedDB = () => {
  const databases = {};

  const request = (getResult) => {
    const req = {};
    setTimeout(() => {
      try {
        req.result = getResult();
        req.onsuccess?.({ target: req });
      } catch (error) {
        req.error = error;
        req.onerror?.({ target: req });
      }
    });
    return req;
  };

  const objectStore = (records, keyPath) => ({
    get: (key) => request(() => records.get(key)),
    getAll: () => request(() => [...records.values()]),
    put: (value) => request(() => records.set(value[keyPath], value)),
    delete: (key) => request(() => records.delete(key)),
    openCursor: () => {
      const entries = [...records.entries()];
      const req = {};
      const step = (index) =>
        setTimeout(() => {
          const entry = entries[index];
          req.onsuccess({
            target: {
              result: entry && {
                value: entry[1],
                update: (value) => records.set(entry[0], value),
                continue: () => step(index + 1),
              },
            },
          });
        });
      step(0);
      return req;
    },
  });

  const connection = (db) => ({
    createObjectStore: (name, { keyPath }) => {
      db.stores[name] = { keyPath, records: new Map() };
    },
    transaction: () => ({
      objectStore: (name) =>
        objectStore(db.stores[name].records, db.stores[name].keyPath),
    }),
  });

  return {
    databases,
    error: null,
    open(name, version) {
      const req = {};
      setTimeout(() => {
        if (this.error) {
          req.error = this.error;
          req.onerror();
          return;
        }
        databases[name] ||= { version: 0, stores: {} };
        const db = databases[name];
        req.result = connection(db);
        if (db.version < version) {
          req.transaction = req.result.transaction();
          req.onupgradeneeded({ oldVersion: db.version });
          db.version = version;
        }
        req.onsuccess();
      });
      return req;
    },
  };
};

const fileHandle = (game, { permission = "granted", request } = {}) => ({
  kind: "file",
  getFile: vi.fn(async () => ({ text: async () => JSON.stringify(game) })),
  queryPermission: vi.fn(async () => permission),
  requestPermission: vi.fn(async () => request),
});

const game = { info: { title: "18Test", designer: "Pat" }, map: {} };
let idb;

const records = (store) => idb.databases["18xx-maker"].stores[store].records;

beforeEach(() => {
  idb = createIndexedDB();
  vi.stubGlobal("indexedDB", idb);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("system games in IndexedDB", () => {
  it("saves a file handle and lists its summary without the handle", async () => {
    const handle = fileHandle(game);
    const slug = await saveGameHandle(handle);

    const [type, id] = slug.split(":");
    expect(type).toBe("system");
    expect(isUUID(id)).toBe(true);

    expect(records("game_file_handles").get(id).handle).toBe(handle);
    expect(await loadSummaries()).toEqual({
      [slug]: { title: "18Test", designer: "Pat", id, type: "system", slug },
    });
  });

  it("saves directory handles in their own store", async () => {
    const handle = { ...fileHandle(game), kind: "directory" };
    await saveGameHandle(handle);

    expect(records("game_directory_handles").size).toBe(1);
    expect(await loadSummaries()).toEqual({});
  });

  it("rejects files that aren't games", async () => {
    const handle = {
      kind: "file",
      getFile: async () => ({ text: async () => "{" }),
    };
    await expect(saveGameHandle(handle)).rejects.toThrow(
      "File was not a valid 18xx-maker game",
    );
  });

  it("peeks at a game with permission and changes nothing", async () => {
    const handle = fileHandle(game);
    const slug = await saveGameHandle(handle);
    const id = slug.split(":")[1];
    const before = { ...records("game_file_handles").get(id) };

    expect(await peekGame(id)).toEqual({
      ...game,
      meta: { id, type: "system", slug },
    });
    expect(records("game_file_handles").get(id)).toEqual(before);
  });

  it("never asks for permission or deletes when peeking", async () => {
    const handle = fileHandle(game);
    const slug = await saveGameHandle(handle);
    const id = slug.split(":")[1];
    handle.queryPermission.mockResolvedValue("prompt");
    handle.requestPermission.mockResolvedValue("granted");

    await expect(peekGame(id)).rejects.toThrow("Permission needed");
    expect(handle.requestPermission).not.toHaveBeenCalled();

    handle.queryPermission.mockResolvedValue("granted");
    handle.getFile.mockRejectedValue(new DOMException("gone", "NotFoundError"));
    await expect(peekGame(id)).rejects.toThrow();
    expect(records("game_file_handles").has(id)).toBe(true);
  });

  it("loads a game and refreshes its summary", async () => {
    const handle = fileHandle(game);
    const slug = await saveGameHandle(handle);
    const id = slug.split(":")[1];

    // The file changed since it was added
    const changed = { info: { title: "18Changed" } };
    handle.getFile.mockResolvedValue({
      text: async () => JSON.stringify(changed),
    });

    expect(await loadGame(id)).toEqual({
      ...changed,
      meta: { id, type: "system", slug },
    });
    expect((await loadSummaries())[slug].title).toBe("18Changed");
  });

  it("asks for permission when it isn't granted yet", async () => {
    const handle = fileHandle(game, {
      permission: "prompt",
      request: "granted",
    });
    const id = (await saveGameHandle(handle)).split(":")[1];

    expect((await loadGame(id)).info.title).toBe("18Test");
    expect(handle.requestPermission).toHaveBeenCalledOnce();
  });

  it("fails when permission is denied", async () => {
    const handle = fileHandle(game, {
      permission: "prompt",
      request: "denied",
    });
    const id = (await saveGameHandle(handle)).split(":")[1];

    await expect(loadGame(id)).rejects.toThrow("Permission denied");
    // The game is kept so it can be tried again
    expect(records("game_file_handles").has(id)).toBe(true);
  });

  it("asks for write permission only when it isn't granted", async () => {
    const granted = fileHandle(game);
    const idGranted = (await saveGameHandle(granted)).split(":")[1];
    await requestWrite(idGranted);
    expect(granted.queryPermission).toHaveBeenCalledWith({
      mode: "readwrite",
    });
    expect(granted.requestPermission).not.toHaveBeenCalled();

    const prompt = fileHandle(game, {
      permission: "prompt",
      request: "granted",
    });
    const idPrompt = (await saveGameHandle(prompt)).split(":")[1];
    await requestWrite(idPrompt);
    expect(prompt.requestPermission).toHaveBeenCalledWith({
      mode: "readwrite",
    });
  });

  it("fails when write permission is denied", async () => {
    const handle = fileHandle(game, {
      permission: "prompt",
      request: "denied",
    });
    const id = (await saveGameHandle(handle)).split(":")[1];

    await expect(requestWrite(id)).rejects.toThrow("Permission denied");
  });

  it("writes the text through the stored handle", async () => {
    const writable = {
      write: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
      abort: vi.fn(async () => {}),
    };
    const handle = {
      ...fileHandle(game),
      createWritable: async () => writable,
    };
    const id = (await saveGameHandle(handle)).split(":")[1];

    await writeGame(id, "text");

    expect(writable.write).toHaveBeenCalledWith("text");
    expect(writable.close).toHaveBeenCalled();
    expect(writable.abort).not.toHaveBeenCalled();
  });

  it("aborts the write when it fails", async () => {
    const writable = {
      write: vi.fn(async () => {
        throw new Error("disk full");
      }),
      close: vi.fn(async () => {}),
      abort: vi.fn(async () => {}),
    };
    const handle = {
      ...fileHandle(game),
      createWritable: async () => writable,
    };
    const id = (await saveGameHandle(handle)).split(":")[1];

    await expect(writeGame(id, "text")).rejects.toThrow("disk full");
    expect(writable.abort).toHaveBeenCalled();
  });

  it("fails for unknown games", async () => {
    await expect(loadGame("nope")).rejects.toThrow(
      "System game nope not found",
    );
  });

  it("forgets games whose file has been deleted", async () => {
    const handle = fileHandle(game);
    const id = (await saveGameHandle(handle)).split(":")[1];
    handle.getFile.mockRejectedValue(
      Object.assign(new Error("gone"), { name: "NotFoundError" }),
    );

    await expect(loadGame(id)).rejects.toThrow(
      `System game ${id} not found, most likly the file has been deleted or moved`,
    );
    expect(records("game_file_handles").has(id)).toBe(false);
  });

  it("deletes games", async () => {
    const id = (await saveGameHandle(fileHandle(game))).split(":")[1];
    await deleteGame(id);
    expect(await loadSummaries()).toEqual({});
  });

  it("rejects when the database can't be opened", async () => {
    idb.error = new Error("blocked");
    await expect(loadSummaries()).rejects.toThrow("blocked");
  });

  it("migrates version 1 summaries when upgrading", async () => {
    // A version 1 database with an unversioned summary
    idb.databases["18xx-maker"] = {
      version: 1,
      stores: {
        game_directory_handles: { keyPath: "id", records: new Map() },
        game_file_handles: {
          keyPath: "id",
          records: new Map([
            ["old", { id: "old", slug: "system:old", title: "18Old" }],
          ]),
        },
      },
    };

    await loadSummaries();
    await vi.waitFor(() =>
      expect(records("game_file_handles").get("old").version).toBe(1),
    );

    const migrated = records("game_file_handles").get("old");
    expect(isUUID(migrated.id)).toBe(true);
    expect(migrated.slug).toBe(`system:${migrated.id}`);
    expect(migrated.title).toBe("18Old");
  });
});

describe("openFilePicker", () => {
  afterEach(() => {
    delete window.showOpenFilePicker;
  });

  it("saves the picked game and returns its slug", async () => {
    window.showOpenFilePicker = vi.fn(async () => [fileHandle(game)]);

    const slug = await openFilePicker();

    expect(slug).toMatch(/^system:/);
    expect(window.showOpenFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeAcceptAllOption: true,
        types: [
          {
            description: "18xx-maker Game",
            accept: { "application/json": [".json"] },
          },
        ],
      }),
    );
    expect(Object.keys(await loadSummaries())).toEqual([slug]);
  });

  it("does nothing when more than one file comes back", async () => {
    window.showOpenFilePicker = async () => [
      fileHandle(game),
      fileHandle(game),
    ];
    expect(await openFilePicker()).toBeUndefined();
    expect(idb.databases).toEqual({});
  });

  it("ignores the picker being cancelled", async () => {
    window.showOpenFilePicker = async () => {
      throw new DOMException("cancelled", "AbortError");
    };
    expect(await openFilePicker()).toBeUndefined();
  });

  it("passes on other picker errors", async () => {
    window.showOpenFilePicker = async () => {
      throw new DOMException("not allowed", "SecurityError");
    };
    await expect(openFilePicker()).rejects.toThrow("not allowed");
  });
});

describe("createGameFile", () => {
  afterEach(() => {
    delete window.showSaveFilePicker;
  });

  // A handle that records what is written and in which order
  const saveHandle = (calls, { failWrite = false } = {}) => {
    let text = "";
    return {
      ...fileHandle(game),
      createWritable: vi.fn(async () => ({
        write: vi.fn(async (data) => {
          calls.push("write");
          if (failWrite) throw new Error("disk full");
          text = data;
        }),
        close: vi.fn(async () => calls.push("close")),
        abort: vi.fn(async () => calls.push("abort")),
      })),
      getFile: vi.fn(async () => {
        calls.push("getFile");
        return { text: async () => text };
      }),
    };
  };

  it("writes the file before it remembers the handle", async () => {
    const calls = [];
    const text = JSON.stringify(game);
    window.showSaveFilePicker = vi.fn(async () => saveHandle(calls));

    const slug = await createGameFile(text, "new-game.json");

    expect(slug).toMatch(/^system:/);
    expect(calls).toEqual(["write", "close", "getFile"]);
    expect(window.showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestedName: "new-game.json",
        excludeAcceptAllOption: true,
        id: "18xx-maker-games",
      }),
    );
    expect(Object.keys(await loadSummaries())).toEqual([slug]);
  });

  it("ignores the picker being cancelled", async () => {
    window.showSaveFilePicker = async () => {
      throw new DOMException("cancelled", "AbortError");
    };
    expect(await createGameFile("{}", "a.json")).toBeUndefined();
    expect(idb.databases).toEqual({});
  });

  it("aborts a failed write and remembers nothing", async () => {
    const calls = [];
    window.showSaveFilePicker = async () =>
      saveHandle(calls, { failWrite: true });

    await expect(createGameFile("{}", "a.json")).rejects.toThrow("disk full");
    expect(calls).toEqual(["write", "abort"]);
    expect(idb.databases).toEqual({});
  });

  describe("registered files", () => {
    // Handles of the same file answer isSameEntry like the browser does
    const sameFile = (id, game) => ({
      ...fileHandle(game),
      id,
      isSameEntry: vi.fn(async (other) => other.id === id),
    });

    it("reuses the id of a file that is already registered", async () => {
      const first = await saveGameHandle(sameFile("a", game));
      await saveGameHandle(sameFile("b", game));
      const again = await saveGameHandle(
        sameFile("a", { ...game, map: { x: 1 } }),
      );

      expect(again).toBe(first);
      expect(Object.keys(await loadSummaries())).toHaveLength(2);
    });

    it("gives a new id to a file that is not registered", async () => {
      const first = await saveGameHandle(sameFile("a", game));
      const second = await saveGameHandle(sameFile("b", game));
      expect(second).not.toBe(first);
    });

    it("reuses the id of the file a save as picked again", async () => {
      const calls = [];
      const handle = sameFile("a", game);
      const known = await saveGameHandle(handle);
      window.showSaveFilePicker = async () => ({
        ...handle,
        createWritable: async () => ({
          write: async () => calls.push("write"),
          close: async () => calls.push("close"),
          abort: async () => {},
        }),
      });

      expect(await createGameFile("{}", "x.json")).toBe(known);
      expect(Object.keys(await loadSummaries())).toEqual([known]);
    });

    it("saves the text it was given", async () => {
      let written;
      window.showSaveFilePicker = async () => ({
        ...fileHandle(game),
        createWritable: async () => ({
          write: async (text) => (written = text),
          close: async () => {},
          abort: async () => {},
        }),
      });
      await createGameFile('{"info":{"title":"T"}}', "t.json");
      expect(written).toBe('{"info":{"title":"T"}}');
    });
  });
});
