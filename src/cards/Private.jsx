import React, { useContext } from "react";
import GameContext from "../context/GameContext";
import { MapOrientation } from "../context/OrientationContext";

import Color from "../util/Color";
import Currency from "../util/Currency";
import GameCompanyToken from "../tokens/GameCompanyToken";
import Hex from "../Hex";
import Icon from "../atoms/Icon";
import Svg from "../Svg";
import Tile from "../Tile";
import Token from "../tokens/Token";

import ColorContext from "../context/ColorContext";

import intersperse from "ramda/src/intersperse";
import is from "ramda/src/is";
import map from "ramda/src/map";
import defaultTo from "ramda/src/defaultTo";

import max from "ramda/src/max";
import min from "ramda/src/min";
import reduce from "ramda/src/reduce";

import { getMapHex } from "../map/util";

import "./private.scss";

const Private = ({
  name,
  nameFontSize,
  note,
  noteFontSize,
  price,
  revenue,
  bid,
  players,
  minPlayers,
  maxPlayers,
  description,
  descFontSize,
  icon,
  iconColor,
  hex,
  tile,
  token,
  company,
  id,
  idFontSize,
  idBackgroundColor,
  backgroundColor,
  variant
}) => {
  const { game } = useContext(GameContext);
  let descFontSizeInch = defaultTo(0.085, descFontSize / 72);
  let noteFontSizeInch = defaultTo(0.12, noteFontSize / 72);
  let nameFontSizeInch = defaultTo(0.18, nameFontSize / 72);
  let idFontSizeInch = defaultTo(0.13, idFontSize / 72);
  backgroundColor = defaultTo("white", backgroundColor);
  idBackgroundColor = defaultTo("white", idBackgroundColor);

  let revenueNode = null;
  if (is(Array, revenue)) {
    revenueNode = intersperse(<span key="span">/</span>, map(r => <Currency key={r} value={r} type="private" />, revenue));
  } else if (is(Number, revenue)) {
    revenueNode = <Currency value={revenue} type="private" />;
  }

  let playersNode = null;
  if (players) {
    let minNumPlayers = reduce(min, 99, map(p => p.number, players))
    let maxNumPlayers = reduce(max, 0, map(p => p.number, players))
    minPlayers = minPlayers || minNumPlayers;
    maxPlayers = maxPlayers || maxNumPlayers;

    if (minPlayers !== minNumPlayers || maxPlayers !== maxNumPlayers) {
      if (minPlayers !== maxPlayers) {
        playersNode = `Players: ${minPlayers}-${maxPlayers}`;
      } else {
        playersNode = `Players: ${minPlayers}`;
      }
    }
  }

  let hexNode = null;
  if (hex) {
    let hexData = getMapHex(game, hex);
    hexNode = (<MapOrientation>
                 <div className="private__hex">
                   <Svg viewBox="-80 -80 160 160">
                     <Hex hex={hexData} border={true} map={true} />
                   </Svg>
                 </div>
               </MapOrientation>);
  } else if (tile) {
    hexNode = (<div className="private__tile">
                 <Svg viewBox="-80 -80 160 160">
                   <Tile id={tile} border={true} gameTiles={game.tiles} />
                 </Svg>
               </div>);
  }

  return (
    <div className="cutlines">
      <div className="card private">
        <ColorContext.Provider value="companies">
        <Color>
          {c => (
            <div className="card__bleed"
                 style={{
                   backgroundColor: c(backgroundColor)
                 }}>
              <div className="card__body">
                <div className="private__name"
                  style={{
                    fontSize: `${nameFontSizeInch}in`,
                    lineHeight: `${nameFontSizeInch + 0.02}in`
                  }}>
                  {id && <div className="private__id"
                    style={{
                      backgroundColor: c(idBackgroundColor),
                      fontSize: `${idFontSizeInch}in`,
                      lineHeight: `${idFontSizeInch + 0.02}in`
                    }}>{id}</div>}
                  {name}
                </div>
                {note && <div className="private__note"
                    style={{
                      fontSize: `${noteFontSizeInch}in`,
                      lineHeight: `${noteFontSizeInch + 0.02}in`
                    }}>
                  {Array.isArray(note)
                   ? note.reduce((lines, line) => <>{lines}<br />{line}</>)
                   : note}</div>}
                <div className="private__description"
                    style={{
                      fontSize: `${descFontSizeInch}in`,
                      lineHeight: `${descFontSizeInch + 0.02}in`
                    }}>
                  {hexNode}
                  {company && <div className="private__company">
                               <Svg viewBox="-15 -15 30 30">
                                 <GameCompanyToken abbrev={company} outlineWidth={15/25} width={15} />
                               </Svg>
                             </div>}
                  {token && <div className="private__company">
                             <Svg viewBox="-15 -15 30 30">
                               <Token {...token} outlineWidth={token.outlineWidth || "2"} width={15} />
                             </Svg>
                           </div>}
                  {icon && <div className="private__icon">
                            <Svg viewBox="-15 -15 30 30">
                              <Icon type={icon} color={iconColor} />
                            </Svg>
                          </div>}
                  {Array.isArray(description)
                   ? description.reduce((lines, line) => <>{lines}<br />{line}</>)
                   : description}
                </div>
                {bid && <div className="private__bid">Min bid: <Currency value={bid} type="private"/></div>}
                <div className="private__price"><Currency value={price} type="private"/></div>
                {playersNode && <div className="private__players">{playersNode}</div>}
                {revenueNode && <div className="private__revenue">Revenue: {revenueNode}</div>}
                {variant && <div className="private__variant">{variant}</div>}
              </div>
            </div>
          )}
        </Color>
        </ColorContext.Provider>
      </div>
    </div>
  );
};

export default Private;
