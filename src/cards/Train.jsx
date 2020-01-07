import React from "react";

import Color from "../data/Color";
import Currency from "../util/Currency";
import Config from "../data/Config";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import "./train.scss";

import yellowTrain from "../images/yellow-train.png";
import greenTrain from "../images/green-train.png";
import brownTrain from "../images/brown-train.png";
import grayTrain from "../images/gray-train.png";

const Train = ({ train, blackBand }) => {
  let { name, price, color, info, description, players } = train;

  let notes = addIndex(map)(
    (i, index) => (
      <Color key={index}>
        {(c,t) => (
          <span
            className="train__info"
            style={{
              backgroundColor: c(i.color),
              color: t(c(i.color))
            }}
          >
            {i.note}
          </span>
        )}
      </Color>
    ),
    info
  );

  if (players) {
    notes.unshift(
      <span key="players" className="train__players">
        {players}
      </span>
    );
  }

  let image = null;
  switch (color) {
  case "green":
    image = greenTrain;
    break;
  case "brown":
    image = brownTrain;
    break;
  case "gray":
    image = grayTrain;
    break;
  default:
    image = yellowTrain;
    break;
  }

  return (
    <div className="cutlines">
      <Color>
        {(c,t) => (
          <Config>
            {config => (
              <div className="card train">
                <div className="card__bleed">
                  <div className="train__hr"
                       style={{
                         backgroundColor: c(color),
                         borderBottom: (color === "white" || config.cards.blackBand) ? "2px solid black" : null
                       }}
                  />
                  <div className="card__body">
                    <React.Fragment>
                      <div className="train__name" style={{ color: t(c(color)) }}>{name}</div>
                      <div className="train__price" style={{ color: t(c(color)) }}>
                        <Currency value={price} type="train"/>
                      </div>
                      <div className="train__description">{description}</div>
                      <div className="train__notes">{notes}</div>
                      {config.cards.trainImages && (
                        <div className="train__image"><img alt={`${color} train`} src={image}/></div>
                      )}
                    </React.Fragment>
                  </div>
                </div>
              </div>
            )}
          </Config>
        )}
      </Color>
    </div>
  );
};

export default Train;
