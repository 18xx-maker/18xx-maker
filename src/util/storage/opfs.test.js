// @vitest-environment jsdom

import { validate } from "uuid";

import {
  deleteGame,
  loadGame,
  loadSummaries,
  peekGame,
  saveGameFile,
} from "@/util/storage/opfs";

// An in-memory origin private file system with a single directory level
const createStorage = () => {
  const directories = {};

  const notFound = () => new DOMException("not found", "NotFoundError");

  const fileHandle = (files, name) => ({
    kind: "file",
    name,
    getFile: async () => {
      const content = files.get(name);
      return {
        name,
        text: async () =>
          typeof content === "string" ? content : content.text(),
      };
    },
    createWritable: async () => {
      let written = "";
      return {
        write: async (data) => {
          written = data;
        },
        close: async () => {
          files.set(name, written);
        },
      };
    },
  });

  const directoryHandle = (files) => ({
    async *values() {
      for (const name of files.keys()) {
        yield fileHandle(files, name);
      }
    },
    getFileHandle: async (name, { create = false } = {}) => {
      if (!files.has(name)) {
        if (!create) throw notFound();
        files.set(name, "");
      }
      return fileHandle(files, name);
    },
    removeEntry: async (name) => {
      if (!files.delete(name)) throw notFound();
    },
  });

  const root = {
    getDirectoryHandle: vi.fn(async (name, { create = false } = {}) => {
      if (!directories[name]) {
        if (!create) throw notFound();
        directories[name] = new Map();
      }
      return directoryHandle(directories[name]);
    }),
  };

  return { directories, getDirectory: async () => root, root };
};

const game = { info: { title: "18Test", publisher: "Self" }, map: {} };
let storage;
const games = () => storage.directories.games;

beforeEach(() => {
  storage = createStorage();
  vi.stubGlobal("navigator", { storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("internal games in OPFS", () => {
  it("saves files into the games directory under a new id", async () => {
    const slug = await saveGameFile(
      new File([JSON.stringify(game)], "18Test.json"),
    );

    const [type, id] = slug.split(":");
    expect(type).toBe("internal");
    expect(validate(id)).toBe(true);
    expect([...games().keys()]).toEqual([`${id}.json`]);
    expect(storage.root.getDirectoryHandle).toHaveBeenCalledWith("games", {
      create: true,
    });
  });

  it("writes through a worker when createWritable is unavailable", async () => {
    const original = storage.root.getDirectoryHandle;
    storage.root.getDirectoryHandle = async (...args) => {
      const dir = await original(...args);
      const getFileHandle = dir.getFileHandle;
      dir.getFileHandle = async (...a) => {
        const handle = await getFileHandle(...a);
        delete handle.createWritable;
        return handle;
      };
      return dir;
    };
    const posted = [];
    class FakeWorker {
      postMessage(data) {
        posted.push(data);
        queueMicrotask(() => this.onmessage({ data: null }));
      }
      terminate() {}
    }
    vi.stubGlobal("Worker", FakeWorker);
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();

    const slug = await saveGameFile(JSON.stringify(game));

    expect(posted).toHaveLength(1);
    expect(posted[0].filename).toBe(`${slug.split(":")[1]}.json`);
    expect(new TextDecoder().decode(posted[0].buffer)).toBe(
      JSON.stringify(game),
    );
  });

  it("lists summaries of saved games by slug", async () => {
    const slug = await saveGameFile(JSON.stringify(game));
    const id = slug.split(":")[1];

    expect(await loadSummaries()).toEqual({
      [slug]: {
        title: "18Test",
        publisher: "Self",
        id,
        type: "internal",
        slug,
      },
    });
  });

  it("removes files that aren't games when listing", async () => {
    const slug = await saveGameFile(JSON.stringify(game));
    games().set("broken.json", "{");

    expect(Object.keys(await loadSummaries())).toEqual([slug]);
    expect(games().has("broken.json")).toBe(false);
  });

  it("loads a saved game with its meta data", async () => {
    const slug = await saveGameFile(JSON.stringify(game));
    const id = slug.split(":")[1];

    expect(await loadGame(id)).toEqual({
      ...game,
      meta: { id, type: "internal", slug },
    });
  });

  it("removes a saved game that isn't valid when loading it", async () => {
    storage.directories.games = new Map([["bad.json", "not json"]]);

    await expect(loadGame("bad")).rejects.toThrow(
      "File was not a valid 18xx-maker game",
    );
    expect(games().has("bad.json")).toBe(false);
  });

  it("reports an invalid game when the file does not exist", async () => {
    await expect(loadGame("missing")).rejects.toThrow(
      "File was not a valid 18xx-maker game",
    );
  });

  it("peeks at a game without deleting it when it is not valid", async () => {
    storage.directories.games = new Map([["bad.json", "not json"]]);

    await expect(peekGame("bad")).rejects.toThrow();
    expect(games().has("bad.json")).toBe(true);
  });

  it("peeks at a saved game with its meta data", async () => {
    const slug = await saveGameFile(JSON.stringify(game));
    const id = slug.split(":")[1];

    expect(await peekGame(id)).toEqual({
      ...game,
      meta: { id, type: "internal", slug },
    });
  });

  it("deletes games", async () => {
    const id = (await saveGameFile(JSON.stringify(game))).split(":")[1];
    await deleteGame(id);
    expect(games().size).toBe(0);
  });
});
