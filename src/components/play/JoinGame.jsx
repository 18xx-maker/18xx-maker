import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PlayNotice, { BackLink } from "@/components/play/PlayNotice";

import { useNavigate } from "@/router";

// The page of an invite link: the game's title, then a name and a color.
// A signed out visitor signs in first and comes back to the same link.
const JoinGame = ({ code, play }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { api, status, user, signInUrl } = play;
  const [invite, setInvite] = useState(null);
  const [problem, setProblem] = useState(null);
  const [name, setName] = useState(null);
  const [color, setColor] = useState("#c0392b");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .getInvite(code)
      .then((found) => live && setInvite(found))
      .catch(
        (error) =>
          live &&
          setProblem(
            error.status === 404
              ? t("play.join.notFound")
              : t("play.join.failed", { message: error.message }),
          ),
      );
    return () => {
      live = false;
    };
  }, [api, code, t]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.join(code, { name: name ?? user.name, color });
      navigate(`/play/${encodeURIComponent(invite.gameId)}`);
    } catch (error) {
      setProblem(
        error.status === 410
          ? t("play.join.closed")
          : t("play.join.failed", { message: error.message }),
      );
      setBusy(false);
    }
  };

  if (status === "loading" || status === "error") {
    return <PlayNotice {...play} back />;
  }

  return (
    <form
      className="flex flex-col items-start gap-2 max-w-sm"
      onSubmit={submit}
    >
      <h2 className="text-2xl font-bold">{t("play.join.title")}</h2>
      {invite && <p className="text-lg">{invite.title}</p>}
      {problem && <p role="alert">{problem}</p>}
      {problem && <BackLink />}
      {invite && status === "signedout" && (
        <PlayNotice status="signedout" signInUrl={signInUrl} />
      )}
      {invite && status === "ready" && (
        <>
          <Label htmlFor="play-join-name">{t("play.join.name")}</Label>
          <Input
            id="play-join-name"
            value={name ?? user.name ?? ""}
            onChange={(e) => setName(e.target.value)}
          />
          <Label htmlFor="play-join-color">{t("play.join.color")}</Label>
          <Input
            id="play-join-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <Button disabled={busy || !(name ?? user.name)} type="submit">
            {busy ? t("play.join.joining") : t("play.join.button")}
          </Button>
        </>
      )}
    </form>
  );
};

export default JoinGame;
