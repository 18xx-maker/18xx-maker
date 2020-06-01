import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import Color from "../data/Color";
import Currency from "../util/Currency";

import find from "ramda/src/find";
import is from "ramda/src/is";
import map from "ramda/src/map";

import "./train.scss";

const ordinal = (num) => {
  switch(num) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${num}th`;
  }
};

const Train = ({ train, trains, blackBand }) => {
  const { config } = useContext(ConfigContext);

  let {
    name,
    price,
    tradeInPrice,
    color,
    description,
    players,
    backgroundColor,
    image,
    phased,
    obsolete,
    rust,
    permanent,
    variant } = train;

  let notes = [];

  if (phased) {
    let phaseds = is(Array, phased) ? phased : [phased];

    let events = map(r => {
      if (is(Object, r)) {
        return `${ordinal(r.index)} ${r.on}`;
      }

      return r;
    }, phaseds).join(", ");

    let phasedBy = `Phased out by ${events}`;
    let phasedOn = is(Object, phaseds[0]) ? phaseds[0].on : phaseds[0];

    let eventTrain = find(t => {
      return t.name === phasedOn;
    }, trains);

    notes.push(
      <Color key="obsolete">
        {(c,t) => (
          <span className="train__info"
                style={{
                  backgroundColor: c(eventTrain.color),
                  color: t(c(eventTrain.color))
                }} >{phasedBy}</span>
        )}
      </Color>
    );
  }

  if (obsolete) {
    let obsoletes = is(Array, obsolete) ? obsolete : [obsolete];

    let events = map(r => {
      if (is(Object, r)) {
        return `${ordinal(r.index)} ${r.on}`;
      }

      return r;
    }, obsoletes).join(", ");

    let obsoleteBy = `Obsoleted by ${events}`;
    let obsoleteOn = is(Object, obsoletes[0]) ? obsoletes[0].on : obsoletes[0];

    let eventTrain = find(t => {
      return t.name === obsoleteOn;
    }, trains);

    notes.push(
      <Color key="obsolete">
        {(c,t) => (
          <span className="train__info"
                style={{
                  backgroundColor: c(eventTrain.color),
                  color: t(c(eventTrain.color))
                }} >{obsoleteBy}</span>
        )}
      </Color>
    );
  }

  if (rust) {
    let rusts = is(Array, rust) ? rust : [rust];

    let events = map(r => {
      if (is(Object, r)) {
        return `${ordinal(r.index)} ${r.on}`;
      }

      return r;
    }, rusts).join(", ");

    let rustedBy = `Rusted by ${events}`;
    let rustedOn = is(Object, rusts[0]) ? rusts[0].on : rusts[0];

    let eventTrain = find(t => {
      return t.name === rustedOn;
    }, trains);

    notes.push(
      <Color key="rust">
        {(c,t) => (
          <span className="train__info"
                style={{
                  backgroundColor: c(eventTrain.color),
                  color: t(c(eventTrain.color))
                }} >{rustedBy}</span>
        )}
      </Color>
    );
  }

  if (!phased && !obsolete && !rust && permanent !== false) {
    notes.push(
      <Color key="rust">
        {(c,t) => (
          <span className="train__info"
                style={{
                  backgroundColor: c("yellow"),
                  color: t(c("yellow"))
                }} >Permanent</span>
        )}
      </Color>
    );
  }

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
                  <div className={`train__image train__image--${image}`}><img alt={`${color} ${name} train`} src={require(`../images/trains/${image}.png`)}/></div>
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
      </Color>
    </div>
  );
};

export default Train;
