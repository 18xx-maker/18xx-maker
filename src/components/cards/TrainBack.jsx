import Color from "@/components/Color";

import { useConfig } from "@/hooks";

// The back of a train card: the title (the name of the train by default) and
// an optional text on a colored background.
const TrainBack = ({ train, bare }) => {
  const { config } = useConfig();
  const { title, text, color, backgroundColor } = train.back;

  return (
    <div className={bare ? undefined : "cutlines"}>
      <Color>
        {(c, t) => {
          const background = c(backgroundColor || "white");
          return (
            <div
              className={`card train train-back card--${config.cards.layout}`}
            >
              <div
                className="card__bleed"
                style={{ backgroundColor: background }}
              >
                <div
                  className="card__body train-back__body"
                  style={{ color: color ? c(color) : t(background) }}
                >
                  <div className="train-back__title">{title ?? train.name}</div>
                  {text && <div className="train-back__text">{text}</div>}
                </div>
              </div>
            </div>
          );
        }}
      </Color>
    </div>
  );
};

export default TrainBack;
