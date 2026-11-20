import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createGameBody } from "@/play/client/createGame";
import { Link, useNavigate } from "@/router";
import {
  selectAssets,
  selectGameState,
  selectStoredConfig,
} from "@/state/selectors";

// The server accepts images up to this size (MAX_ASSET_BYTES of the server)
const ASSET_MB = 1;

// An image of the assets (svg text or a png data url) as the file to upload
const toBlob = (value) => {
  const png = /^data:image\/png;base64,(.*)$/.exec(value);
  if (!png) return new Blob([value], { type: "image/svg+xml" });
  const binary = atob(png[1]);
  return new Blob([Uint8Array.from(binary, (c) => c.charCodeAt(0))], {
    type: "image/png",
  });
};

const messageOf = (error) =>
  error.message || (error.status === 0 ? "network" : `HTTP ${error.status}`);

// Creates an online game from the game on screen and its images
const CreateGame = ({ api, user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const game = useSelector(selectGameState);
  const config = useSelector(selectStoredConfig);
  const assets = useSelector(selectAssets);
  const [seatName, setSeatName] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  if (!user.canCreate) return <p>{t("play.create.forbidden")}</p>;

  const submit = async (event) => {
    event.preventDefault();
    setProblem(null);

    // Every image is checked before the game exists: a game created and then
    // refused its images would be left behind
    const files = Object.entries(assets || {}).flatMap(([kind, images]) =>
      Object.entries(images).map(([name, value]) => ({
        name,
        kind,
        blob: toBlob(value),
      })),
    );
    const large = files.filter(({ blob }) => blob.size > ASSET_MB * 1048576);
    if (large.length) {
      setProblem({
        message: t("play.create.tooLarge", {
          size: ASSET_MB,
          names: large.map(({ kind, name }) => `${kind}/${name}`).join(", "),
        }),
      });
      return;
    }

    setBusy(true);
    let created;
    try {
      created = await api.createGame(
        createGameBody({ game, config, seatName: seatName ?? user.name }),
      );
    } catch (error) {
      setProblem({
        errors: error.errors,
        message: t("play.create.failed", { message: messageOf(error) }),
      });
      setBusy(false);
      return;
    }

    for (const { kind, name, blob } of files) {
      try {
        await api.putAsset(created.id, `${kind}.${name}`, blob);
      } catch (error) {
        setProblem({
          id: created.id,
          message: t("play.create.uploadFailed", {
            name: `${kind}/${name}`,
            message: messageOf(error),
          }),
        });
        setBusy(false);
        return;
      }
    }
    navigate(`/play/${encodeURIComponent(created.id)}`);
  };

  return (
    <form
      className="flex flex-col items-start gap-2 max-w-sm"
      onSubmit={submit}
    >
      <h2 className="text-2xl font-bold">{t("play.create.title")}</h2>
      {!game && <p>{t("play.create.noGame")}</p>}
      <Label htmlFor="play-create-name">{t("play.create.name")}</Label>
      <Input
        id="play-create-name"
        value={seatName ?? user.name ?? ""}
        onChange={(e) => setSeatName(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        {t("play.create.note", { size: ASSET_MB })}
      </p>
      <Button disabled={!game || busy} type="submit">
        {busy ? t("play.create.creating") : t("play.create.button")}
      </Button>
      {problem && (
        <div role="alert">
          <p>{problem.message}</p>
          {problem.errors && (
            <>
              <p>{t("play.create.invalid")}</p>
              <ul className="list-disc pl-5">
                {problem.errors.map((e, i) => (
                  <li key={i}>
                    {[e.data?.pointer ?? e.pointer, e.message]
                      .filter(Boolean)
                      .join(" ")}
                  </li>
                ))}
              </ul>
            </>
          )}
          {problem.id && (
            <Link
              className="underline"
              to={`/play/${encodeURIComponent(problem.id)}`}
            >
              {t("play.game.open")}
            </Link>
          )}
        </div>
      )}
    </form>
  );
};

export default CreateGame;
