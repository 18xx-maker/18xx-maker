// A bounded pool of capture slots (the hidden windows of the app), opened when
// needed and closed after recycleAfter documents, so that a window that has
// seen many pages does not hold on to their memory. Plain JS: no Node APIs.
//
// open()   opens a slot, a promise of { close() }
// size     the most slots that are open at once
//
// acquire() gives a free slot, opens one while there are fewer than size, and
// waits when they are all busy. release(slot) gives it back, release(slot,
// { discard: true }) closes it (a slot that failed). close() closes every slot,
// also the busy ones, and the waiting acquires fail.
export const createPool = ({ open, size, recycleAfter = 25 }) => {
  const idle = [];
  const waiting = [];
  const uses = new Map();
  let opening = 0;
  let closed = false;

  const dispose = async (slot) => {
    if (!uses.delete(slot)) return;
    try {
      await slot.close();
    } catch {
      // A slot that is already gone
    }
  };

  // Hands slots to the ones that wait, while there are slots or room for them
  const pump = () => {
    while (waiting.length > 0 && !closed) {
      if (idle.length > 0) {
        waiting.shift().resolve(idle.pop());
      } else if (uses.size + opening < size) {
        const waiter = waiting.shift();
        opening++;
        open().then(
          (slot) => {
            opening--;
            if (closed) {
              slot.close().catch(() => {});
              waiter.reject(new Error("The pool is closed"));
              return;
            }
            uses.set(slot, 0);
            waiter.resolve(slot);
          },
          (error) => {
            opening--;
            waiter.reject(error);
            pump();
          },
        );
      } else {
        return;
      }
    }
  };

  return {
    acquire: () =>
      closed
        ? Promise.reject(new Error("The pool is closed"))
        : new Promise((resolve, reject) => {
            waiting.push({ resolve, reject });
            pump();
          }),

    release: async (slot, { discard = false } = {}) => {
      if (!uses.has(slot)) return;
      const count = uses.get(slot) + 1;
      uses.set(slot, count);
      if (discard || closed || count >= recycleAfter) {
        await dispose(slot);
      } else {
        idle.push(slot);
      }
      pump();
    },

    close: async () => {
      closed = true;
      for (const { reject } of waiting.splice(0)) {
        reject(new Error("The pool is closed"));
      }
      idle.length = 0;
      await Promise.all([...uses.keys()].map(dispose));
    },
  };
};
