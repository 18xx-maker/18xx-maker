import React, { useContext } from "react";
import GameContext from "../context/GameContext";
import { MapOrientation } from "../context/OrientationContext";

import { getFontProps, multiDefaultTo } from "../util";
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

const Private = (props) => {
  let { name, nameFontSize, nameFontFamily, nameFontWeight, nameFontStyle, nameColor,
        id, idFontSize, idFontFamily, idFontWeight, idFontStyle, idColor, idBackgroundColor,
        note, noteFontSize, noteFontFamily, noteFontWeight, noteFontStyle, noteColor,
        description, descFontSize, descFontFamily, descFontWeight, descFontStyle, descColor,
        price, priceFontSize, priceFontFamily, priceFontWeight, priceFontStyle, priceColor,
        revenue, revenueFontSize, revenueFontFamily, revenueFontWeight, revenueFontStyle,
            revenueColor,
        bid, bidFontSize, bidFontFamily, bidFontWeight, bidFontStyle,  bidColor,
        variant, variantFontSize, variantFontFamily, variantFontWeight, variantFontStyle,
            variantColor,
        players, playersFontFamily, playersFontSize, playersFontWeight, playersFontStyle,
            playersColor,
        minPlayers, maxPlayers,
        icon, iconColor,
        hex, tile, token, company,
        fontColor, backgroundColor } = props;
  const { game } = useContext(GameContext);

  const px2pt = 0.75;
  const in2pt = 72;
  const lineHeightAdd = 0.02 * in2pt / px2pt;

  // Optimallly, these *Font css blocks would work with points directly without the units
  // contortions, calculate the lineHeight at 1.2 * the font size, and incluude the color
  // as well.  getFontProps() is along the lines of what's needed, but doesn't do any of
  // the magic to make it elegant.  The default it's all using is px, which is about as
  // inconvenient as it gets.

  // default font sizes come from the css
  //let idFontSizeInch = defaultTo(0.13, idFontSize / 72);
  let idFS = defaultTo(12.48, idFontSize / px2pt); // 0.13" == 9.36pt == 12.48px
  let idFont = getFontProps(props,
      idFS, idFontWeight, idFontFamily, idFontStyle);
  let idLineHeight = idFS + lineHeightAdd;
  idColor = multiDefaultTo("black", idColor, fontColor);

  //let nameFontSizeInch = defaultTo(0.18, nameFontSize / 72);
  let nameFS = defaultTo(17.28, nameFontSize / px2pt); // 0.18" == 12.96pt == 17.28px
  let nameFont = getFontProps(props,
      nameFS, nameFontWeight, nameFontFamily, nameFontStyle);
  let nameLineHeight = nameFS + lineHeightAdd;
  nameColor = multiDefaultTo("black", nameColor, fontColor);

  // let descFontSizeInch = defaultTo(0.085, descFontSize / 72);
  let descFS = defaultTo(8.16, descFontSize / px2pt); // 0.085" == 6.12pt == 8.16px
  let descFont = getFontProps(props,
      descFS, descFontWeight, descFontFamily, descFontStyle);
  let descLineHeight = descFS + lineHeightAdd;
  descColor = multiDefaultTo("black", descColor, fontColor);

  // let noteFontSizeInch = defaultTo(0.12, noteFontSize / 72);
  let noteFS = defaultTo(11.52, noteFontSize / px2pt); // 0.12" == 9.36pt == 11.52px
  let noteFont = getFontProps(props,
      noteFS, noteFontWeight, noteFontFamily, noteFontStyle);
  let noteLineHeight = noteFS + lineHeightAdd;
  noteColor = multiDefaultTo("black", noteColor, fontColor);

  // let revenueFontSizeInch = defaultTo(0.18, idFontSize / 72);
  let revenueFS = defaultTo(17.28, revenueFontSize / px2pt);
  let revenueFont = getFontProps(props,
      revenueFS, revenueFontWeight, revenueFontFamily, revenueFontStyle);
  let revenueLineHeight = revenueFS + lineHeightAdd;
  revenueColor = multiDefaultTo("black", revenueColor, fontColor);

  // let bidFontSizeInch = defaultTo(0.14, nameFontSize / 72);
  let bidFS = defaultTo(13.44, bidFontSize / px2pt); // 0.14" == ??pt == 13.44px
  let bidFont = getFontProps(props,
      bidFS, bidFontWeight, bidFontFamily, bidFontStyle);
  let bidLineHeight = bidFS + lineHeightAdd;
  bidColor = multiDefaultTo("black", bidColor, fontColor);

  // let priceFontSizeInch = defaultTo(0.18, descFontSize / 72);
  let priceFS = defaultTo(17.28, priceFontSize / px2pt);
  let priceFont = getFontProps(props,
      priceFS, priceFontWeight, priceFontFamily, priceFontStyle);
  let priceLineHeight = priceFS + lineHeightAdd;
  priceColor = multiDefaultTo("black", priceColor, fontColor);

  // let variantFontSizeInch = defaultTo(0.5em, variantFontSize / 72);
  let variantFS = defaultTo(8, variantFontSize / px2pt);
  let variantFont = getFontProps(props,
      variantFS, variantFontWeight, variantFontFamily, variantFontStyle);
  let variantLineHeight = variantFS + lineHeightAdd;
  variantColor = multiDefaultTo("black", variantColor, fontColor);

  // let playersFontSizeInch = defaultTo(0.14, playersFontSize / 72);
  let playersFS = defaultTo(13.44, playersFontSize / px2pt);
  let playersFont = getFontProps(props,
      playersFS, playersFontWeight, playersFontFamily, playersFontStyle);
  let playersLineHeight = playersFS + lineHeightAdd;
  playersColor = multiDefaultTo("black", playersColor, fontColor);

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
                    color: c(nameColor),
                    lineHeight: `${nameLineHeight}px`,
                    ...nameFont
                  }}>
                  {id && <div className="private__id"
                    style={{
                      backgroundColor: c(idBackgroundColor),
                      color: c(idColor),
                      lineHeight: `${idLineHeight}px`,
                      ...idFont
                    }}>
                    {id}
                  </div>}
                  {name}
                </div>
                {note && <div className="private__note"
                    style={{
                      color: c(noteColor),
                      lineHeight: `${noteLineHeight}px`,
                      ...noteFont
                    }}>
                  {Array.isArray(note)
                   ? note.reduce((lines, line) => <>{lines}<br />{line}</>)
                   : note}</div>}
                <div className="private__description"
                    style={{
                      color: c(descColor),
                      lineHeight: `${descLineHeight}px`,
                      ...descFont
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
                {bid && <div className="private__bid"
                    style={{
                      color: c(bidColor),
                      lineHeight: `${bidLineHeight}px`,
                      ...bidFont
                    }}>
                  Min bid: <Currency value={bid} type="private"/>
                </div>}
                <div className="private__price"
                    style={{
                      color: c(priceColor),
                      lineHeight: `${priceLineHeight}px`,
                      ...priceFont
                    }}>
                  <Currency value={price} type="private"/>
                </div>
                {playersNode && <div className="private__players"
                    style={{
                      color: c(playersColor),
                      lineHeight: `${playersLineHeight}px`,
                      ...playersFont
                    }}>
                  {playersNode}
                </div>}
                {revenueNode && <div className="private__revenue"
                    style={{
                      color: c(revenueColor),
                      lineHeight: `${revenueLineHeight}px`,
                      ...revenueFont
                    }}>
                  Revenue: {revenueNode}
                </div>}
                {variant && <div className="private__variant"
                    style={{
                      color: c(variantColor),
                      lineHeight: `${variantLineHeight}px`,
                      ...variantFont
                    }}>
                  {variant}
                </div>}
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
