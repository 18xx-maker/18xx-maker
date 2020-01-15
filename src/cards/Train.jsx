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
  let { name, price, color, info, description, players, id, backgroundColor } = train;

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
              <div className={`card train card--${config.cards.layout} train--${config.trains.style}`}>
                <div className="card__bleed"
                     style={{
                       backgroundColor: c(backgroundColor || "white")
                     }}>
                  {config.trains.style === "color" && (<div className="train__hr"
                                                         style={{
                                                           backgroundColor: c(color),
                                                           borderBottom: (color === "white" || config.cards.blackBand) ? "2px solid black" : null
                                                         }}
                                                    />)}
                  <div className="card__body">
                    {config.trains.images && (
                      <div className="train__image"><img alt={`${color} train`} src={image}/></div>
                    )}
                    <div className="train__name" style={{ color: config.trains.style === "color" ? t(c(color)) : c(color) }}>{name}</div>
                    <div className="train__price"
                         style={{ backgroundColor: config.trains.style === "color" ? c(color) : null,
                                  color: t(c(color)) }}>
                      <Currency value={price} type="train"/>
                    </div>
                    {description && <div className="train__description">{description}</div>}
                    <div className="train__notes">{notes}</div>
                    {id && <div className="train__id"><div>{id}</div></div>}
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
