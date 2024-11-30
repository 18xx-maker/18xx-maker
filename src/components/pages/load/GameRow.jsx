import { Link } from "react-router";

import GameType from "@/components/pages/load/GameType";

import { publishers } from "@/data";

const GameRow = ({ game }) => {
  let imageNode = null;

  if (game.publisher && publishers[game.publisher]) {
    let publisher = publishers[game.publisher];

    if (game.publisher !== "self") {
      if (publisher.link) {
        imageNode = (
          <div className="flex flex-row place-content-center p-1 border rounded-lg w-16 h-16 overflow-hidden bg-white">
            <a
              className="block h-full"
              rel="noreferrer"
              target="_blank"
              href={publisher.link}
            >
              <img
                className="block h-full"
                alt={`${publisher.name} Logo`}
                src={publisher.imageUrl}
              />
            </a>
          </div>
        );
      } else {
        imageNode = (
          <div className="border rounded-lg w-16 h-16 overflow-hidden bg-white">
            <img
              className="block h-full"
              alt={`${publisher.name} Logo`}
              src={publisher.imageUrl}
            />
          </div>
        );
      }
    }
  }

  let publisherNode = <div className="absolute top-7 right-0">{imageNode}</div>;

  return (
    <div className="relative border-b pb-8">
      <div className="text-3xl font-bold">
        <Link className="hover:underline" to={`/games/${game.slug}/map`}>
          {game.title}
        </Link>
      </div>
      {game.subtitle && <div className="text-xl">{game.subtitle}</div>}
      <div className="italic text-sm mt-1">by {game.designer}</div>
      <GameType type={game.type} className="right-0 top-0 absolute" />
      {publisherNode}
    </div>
  );
};

export default GameRow;
