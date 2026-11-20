import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo, useState } from "react";
import { vi } from "vitest";

import { omit } from "ramda";

import PlayBoard from "@/components/play/PlayBoard";

import { games } from "@/data";
import { undoTarget } from "@/play/history";
import { reduce } from "@/play/reduce";

import { mountElement, one } from "@tests/support/render.jsx";

// A game as the server holds it: the game file, without the app's meta
export const game = omit(["meta"], games["18Test"]);

// A hook stub: the log grows by every sent event, as the server echoes it
export const Board = ({
  log: initial = [],
  locked = false,
  status,
  presence = [7],
  send,
  game: g = game,
  seats = [{ userId: 7, name: "Ann" }],
}) => {
  const [log, setLog] = useState(() =>
    initial.map((event, i) => ({ seq: i + 1, userId: 7, ...event })),
  );
  const state = useMemo(() => reduce(log), [log]);
  const play = {
    status: status || (locked ? "locked" : "online"),
    game: g,
    config: {},
    seats,
    log,
    state,
    presence,
    me: { userId: 7, name: "Ann" },
    locked,
    missing: false,
    error: null,
    send: (event) => {
      send(event);
      if (!locked)
        setLog((list) => [...list, { ...event, seq: list.length + 1 }]);
    },
    undo: () => {
      const target = undoTarget(log);
      if (locked || target === null) return;
      play.send({ type: "undo", target });
    },
  };
  return <PlayBoard play={play} />;
};

export const mount = async (props = {}) => {
  const send = vi.fn();
  const { root } = await mountElement(<Board send={send} {...props} />);
  const board = await within(root).findByTestId("play-board");
  return { send, board, user: userEvent.setup() };
};

export const cell = (board, coord) => one(board, `[data-coord="${coord}"]`);
export const svgOf = (board) => one(board, "svg[data-play-map]");

// A tap of the pan and zoom svg, dx and dy pixels from the middle of el
export const tap = (board, el, dx = 0, dy = 0) => {
  const rect = el.getBoundingClientRect();
  const init = {
    clientX: rect.x + rect.width / 2 + dx,
    clientY: rect.y + rect.height / 2 + dy,
    button: 0,
    buttons: 1,
    pointerId: 1,
  };
  fireEvent.pointerDown(el, init);
  fireEvent.pointerUp(svgOf(board), { ...init, buttons: 0 });
};

export const tab = (user, name) =>
  user.click(screen.getByRole("tab", { name }));
export const option = (board, attr, id) =>
  one(board, `[data-${attr}-option="${id}"]`);

// A drag of the pan and zoom svg from the middle of el by dx, dy pixels
export const drag = (board, el, dx, dy) => {
  const rect = el.getBoundingClientRect();
  const start = {
    clientX: rect.x + rect.width / 2,
    clientY: rect.y + rect.height / 2,
    button: 0,
    buttons: 1,
    pointerId: 1,
  };
  const end = {
    ...start,
    clientX: start.clientX + dx,
    clientY: start.clientY + dy,
  };
  fireEvent.pointerDown(el, start);
  fireEvent.pointerMove(svgOf(board), end);
  fireEvent.pointerUp(svgOf(board), { ...end, buttons: 0 });
};
