import { validateEvent } from "../../src/play/events.js";
import { reduce } from "../../src/play/reduce.js";

const toEvent = (row) => ({
  seq: row.seq,
  userId: row.user_id,
  type: row.type,
  ...row.payload,
});

export const lastSeq = async (pool, gameId) => {
  const { rows } = await pool.query(
    "select coalesce(max(seq), 0)::int as seq from events where game_id = $1",
    [gameId],
  );
  return rows[0].seq;
};

export const eventsSince = async (pool, gameId, afterSeq) => {
  const { rows } = await pool.query(
    `select seq, user_id, type, payload from events
      where game_id = $1 and seq > $2 order by seq`,
    [gameId, afterSeq],
  );
  return rows.map(toEvent);
};

export const loadSnapshot = async (pool, gameId) => {
  const { rows } = await pool.query(
    `select seq, state from snapshots
      where game_id = $1 order by seq desc limit 1`,
    [gameId],
  );
  return rows[0] ? { seq: rows[0].seq, state: rows[0].state } : null;
};

export const appendEvent = async (
  pool,
  config,
  { gameId, userId, seq, event },
) => {
  const invalid = validateEvent(event);
  const client = await pool.connect();
  try {
    await client.query("begin");
    // The game row lock serializes writers, so the loser sees the winner's row
    const game = await client.query(
      `select status, exists (
                select 1 from seats where game_id = games.id and user_id = $2
              ) as member
         from games where id = $1 for update`,
      [gameId, userId],
    );
    const fail = async (result) => {
      await client.query("rollback");
      return { ok: false, ...result };
    };
    if (!game.rows[0] || !game.rows[0].member)
      return await fail({ reason: "not_member" });
    if (game.rows[0].status !== "active")
      return await fail({ reason: "locked" });
    if (invalid) return await fail({ reason: "invalid", message: invalid });

    const current = await lastSeq(client, gameId);
    if (seq !== current + 1)
      return await fail({ reason: "conflict", currentSeq: current });
    if (
      event.type === "undo" &&
      !(event.target < seq && event.target <= current)
    )
      return await fail({
        reason: "invalid",
        message: "undo target must be an earlier event",
      });

    const payload = { ...event };
    delete payload.type;
    await client.query(
      `insert into events (game_id, seq, user_id, type, payload)
       values ($1, $2, $3, $4, $5)`,
      [gameId, seq, userId, event.type, payload],
    );

    if (seq % config.limits.snapshotEvery === 0) {
      const all = (await eventsSince(client, gameId, 0)).map((e) => {
        const rest = { ...e };
        delete rest.userId;
        return rest;
      });
      await client.query(
        "insert into snapshots (game_id, seq, state) values ($1, $2, $3)",
        [gameId, seq, JSON.stringify(reduce(all))],
      );
    }
    await client.query("commit");
    return { ok: true, seq };
  } catch (err) {
    await client.query("rollback").catch(() => {});
    if (err.code === "23505")
      return {
        ok: false,
        reason: "conflict",
        currentSeq: await lastSeq(pool, gameId),
      };
    throw err;
  } finally {
    client.release();
  }
};
