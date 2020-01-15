import React from "react";

import Color from "../data/Color";
import Config from "../data/Config";
import Currency from "../util/Currency";
import GameCompanyToken from "../tokens/GameCompanyToken";
import Hex from "../Hex";
import Icon from "../atoms/Icon";
import Svg from "../Svg";
import Tile from "../Tile";
import Token from "../tokens/Token";

import intersperse from "ramda/src/intersperse";
import is from "ramda/src/is";
import map from "ramda/src/map";

import { getMapHex } from "../map/util";

import "./private.scss";

const Private = ({
  name,
  note,
  price,
  revenue,
  bid,
  players,
  description,
  icon,
  hex,
  tile,
  token,
  company,
  id,
  backgroundColor
}) => {
  let revenueNode = null;
  if (is(Array, revenue)) {
    revenueNode = intersperse("/", map(r => <Currency value={r} type="private" />, revenue));
  } else if (is(Number, revenue)) {
    revenueNode = <Currency value={revenue} type="private" />;
  }

  return (
    <div className="cutlines">
      <div className="card private">
        <Color>
          {c => (
            <div className="card__bleed"
                 style={{
                   backgroundColor: c(backgroundColor || "white")
                 }}>
              <div className="card__body">
                <div className="private__name">
                  {id && <div className="private__id">{id}</div>}
                  {name}
                </div>
                {note && <div className="private__note">{note}</div>}
                <div className="private__description">
                  <Config>
                    {(config, game) => {
                      if (hex) {
                        let hexData = getMapHex(game, hex);
                        return (<div className="private__hex">
                             <Svg viewBox="-80 -80 160 160">
                               <Hex hex={hexData} id={hex} border={true} map={true} />
                             </Svg>
                           </div>);
                      } else if (tile) {
                        return (<div className="private__tile">
                             <Svg viewBox="-80 -80 160 160">
                               <Tile id={tile} border={true} gameTiles={game.tiles} />
                             </Svg>
                           </div>);
                      } else {
                        return null;
                      }
                    }}
                  </Config>
                  {company && <div className="private__company">
                               <Svg viewBox="-15 -15 30 30">
                                 <GameCompanyToken abbrev={company} outlineWidth={2} width={15} />
                               </Svg>
                             </div>}
                  {token && <div className="private__company">
                             <Svg viewBox="-15 -15 30 30">
                               <Token {...token} outlineWidth={2} width={15} />
                             </Svg>
                           </div>}
                  {icon && <div className="private__icon">
                            <Svg viewBox="-15 -15 30 30">
                              <Icon type={icon} />
                            </Svg>
                          </div>}
                  {description}
                </div>
                {bid && <div className="private__bid">Min Bid: {bid}</div>}
                <div className="private__price"><Currency value={price} type="private"/></div>
                {players && <div className="private__players">{players}</div>}
                {revenueNode && <div className="private__revenue">Revenue: {revenueNode}</div>}
              </div>
            </div>
          )}
        </Color>
      </div>
    </div>
  );
};

export default Private;
