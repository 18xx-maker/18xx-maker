import React from "react";

import Color from "../data/Color";
import Currency from "../util/Currency";
import Config from "../data/Config";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import "./train.scss";

// import yellowTrain from "../images/yellow-train.png";
// import greenTrain from "../images/green-train.png";
// import brownTrain from "../images/brown-train.png";
// import grayTrain from "../images/gray-train.png";

import twoT from "../images/2T.png";
import threeT from "../images/3T.png";
import fourT from "../images/4T.png";
import fiveT from "../images/5T.png";
import sixT from "../images/6T.png";
import diesel from "../images/Diesel.png";
import pullman from "../images/Pullman.png";

const images = {
  "2T": twoT,
  "3T": threeT,
  "4T": fourT,
  "5T": fiveT,
  "6T": sixT,
  "Diesel": diesel,
  "Pullman": pullman
};

const Train = ({ train, blackBand }) => {
  let {
    name,
    price,
    tradeInPrice,
    color,
    info,
    description,
    players,
    backgroundColor,
    image,
    variant } = train;

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
    info || []
  );

  if (players) {
    notes.unshift(
      <span key="players" className="train__players">
        {players}
      </span>
    );
  }

  if (!image) {
    switch (color) {
    case "green":
      image = "3T";
      break;
    case "brown":
      image = "4T";
      break;
    case "gray":
      image = "6T";
      break;
    default:
      image = "2T";
      break;
    }
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
                      <div className={`train__image train__image--${image}`}><img alt={`${color} ${name} train`} src={images[image]}/></div>
                    )}
                    <div className="train__name" style={{ color: config.trains.style === "color" ? t(c(color)) : c(color) }}>{name}</div>
                    <div className="train__price"
                         style={{ backgroundColor: config.trains.style === "color" ? c(color) : null,
                                  color: config.trains.style === "color" ? t(c(color)) : c(color) }}>
                      <Currency value={price} type="train"/>
                      {tradeInPrice && (
                        <div className="train__trade_in_price">
                          (<Currency value={tradeInPrice} type="train"/>)
                        </div>
                      )}
                    </div>
                    {description && <div className="train__description">{description}</div>}
                    <div className="train__notes">{notes}</div>
                    {variant && <div className="train__variant">{variant}</div>}
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
