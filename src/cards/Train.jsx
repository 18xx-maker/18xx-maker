import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import Color from "../util/Color";
import Currency from "../util/Currency";

import find from "ramda/src/find";
import is from "ramda/src/is";
import map from "ramda/src/map";
import defaultTo from "ramda/src/defaultTo";

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
    nameFontSize,
    nameFontFamily,
    price,
    priceFontSize,
    priceFontFamily,
    tradeInPrice,
    color,
    description,
    players,
    backgroundColor,
    image,
    phased,
    phasedText,
    obsolete,
    obsoletedText,
    rust,
    rustedText,
    permanent,
    permanentText,
    permanentColor,
    longevityFontFamily,
    longevityFontSize,
    variant } = train;

  let notes = [];

  nameFontFamily = defaultTo("display", nameFontFamily);
  let nameFontSizeInch = defaultTo(0.5, nameFontSize / 72);

  priceFontFamily = defaultTo("display", priceFontFamily);
  let priceFontSizeInch = defaultTo( 0.25, priceFontSize / 72);

  phasedText = defaultTo("Phased out by", phasedText);
  obsoletedText = defaultTo("Obsoleted by", obsoletedText);
  rustedText = defaultTo("Rusted by", rustedText);
  permanentText = defaultTo("Permanent", permanentText);

  longevityFontFamily = defaultTo("display", longevityFontFamily);
  let longevityFontSizeInch = defaultTo(0.18, longevityFontSize / 72);

  if (phased) {
    let phaseds = is(Array, phased) ? phased : [phased];

    let events = map(r => {
      if (is(Object, r)) {
        return `${ordinal(r.index)} ${r.on}`;
      }

      return r;
    }, phaseds).join(", ");

    let phasedBy = `${phasedText} ${events}`;
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
                  color: t(c(eventTrain.color)),
                  fontSize: `${longevityFontSizeInch}in`,
                  fontFamily: `${longevityFontFamily}`
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

    let obsoleteBy = `${obsoletedText} ${events}`;
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
                  color: t(c(eventTrain.color)),
                  fontSize: `${longevityFontSizeInch}in`,
                  fontFamily: `${longevityFontFamily}`
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

    let rustedBy = `${rustedText} ${events}`;
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
                  color: t(c(eventTrain.color)),
                  fontSize: `${longevityFontSizeInch}in`,
                  fontFamily: `${longevityFontFamily}`
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
                  backgroundColor: permanentColor ? c(permanentColor) : c("yellow"),
                  color: permanentColor ? t(c(permanentColor)) : t(c("yellow")),
                  fontSize: `${longevityFontSizeInch}in`,
                  fontFamily: `${longevityFontFamily}`
                }} >{permanentText}</span>
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
                <div className="train__name"
                  style={{
                    color: config.trains.style === "color" ? t(c(color)) : c(color),
                    fontSize: `${nameFontSizeInch}in`,
                    fontFamily: `${nameFontFamily}`
                  }}>{name}
                </div>
                <div className="train__price"
                  style={{
                    backgroundColor: config.trains.style === "color" ? c(color) : null,
                    color: config.trains.style === "color" ? t(c(color)) : c(color),
                    fontSize: `${priceFontSizeInch}in`,
                    fontFamily: `${priceFontFamily}`
                  }}>
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
