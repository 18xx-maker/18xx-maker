import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ArrowBigRight, TrainTrack } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useGame } from "@/hooks";

const HeaderTitle = () => {
  const { t } = useTranslation();
  const game = useGame();

  return (
    game && (
      <>
        <TrainTrack className="w-4 h-4" />
        <span className="font-medium">{game.info.title}</span>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Button variant="outline" asChild>
          <Link to={`/games/${game.meta.slug}/map`}>
            <ArrowBigRight />
            {t("nav.edit")}
          </Link>
        </Button>
      </>
    )
  );
};

export default HeaderTitle;
