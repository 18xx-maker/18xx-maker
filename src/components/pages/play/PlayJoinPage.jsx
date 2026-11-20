import { useTranslation } from "react-i18next";

import JoinGame from "@/components/play/JoinGame";
import PlayNotice from "@/components/play/PlayNotice";
import useApi from "@/components/play/useApi";

import { useParams } from "@/router";

const PlayJoinPage = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const play = useApi();
  const blocked = play.status === "electron" || play.status === "noServer";

  return (
    <div className="p-4 flex flex-col gap-6" data-testid="play-join">
      <h1 className="text-4xl font-extrabold">{t("play.title")}</h1>
      {blocked ? (
        <PlayNotice {...play} back />
      ) : (
        <JoinGame code={code} play={play} />
      )}
    </div>
  );
};

export default PlayJoinPage;
