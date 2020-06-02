import React, { useContext } from "react";
import ConfigContext from "./context/ConfigContext";
import ColorContext from "./context/ColorContext";

import CompanyToken from "./tokens/CompanyToken";
import Token from "./tokens/Token";
import Phase from "./Phase";
import Color from "./data/Color";
import { unitsToCss } from "./util";
import Currency from "./util/Currency";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import map from "ramda/src/map";

const Charter = ({
  name,
  abbrev,
  logo,
  minor,
  color,
  token,
  tokens,
  phases,
  turns,
  trains,
  game,
  company,
  backgroundColor,
  variant
}) => {
  const { config } = useContext(ConfigContext);
  const charterStyle = config.charters.style;
  const halfWidthCharters = config.charters.halfWidth;
  const blackBand = config.charters.blackBand;
 
  let tokenSpots = addIndex(map)((label, index) => {
    // Color charters just use empty token circles, carth style uses full
    // company tokens.
    let companyToken = charterStyle === "color" ?
        <Token outline="black" /> :
        <CompanyToken company={company} />;

    return (
      <svg key={`token-${index}`}>
        <g transform={`translate(25 25)`}>
          <ColorContext.Provider value="companies">
            {companyToken}
          </ColorContext.Provider>
          <g transform={`${halfWidthCharters ? "rotate(-90) " : ""}translate(0 39)`}>
            <Color context="companies">
              {(c, t) => (
                <text fill={(charterStyle === "color" && !halfWidthCharters) ? t(c(color)) : c("black")}
                      fontSize="11" fontWeight="normal" textAnchor="middle">
                  <Currency value={label} type="token"/>
                </text>
              )}
            </Color>
          </g>
        </g>
      </svg>
    );
  }, tokens);

  let turnNodes = chain(turn => {
    let steps = addIndex(map)((step, i) => {
      return <li key={i}><span>{step}</span></li>;
    }, turn.steps || []);

    let stepsList = turn.ordered ? <ol>{steps}</ol> : <ul>{steps}</ul>;

    let optionals = addIndex(map)((step, i) => {
      return <li key={i}><span>{step}</span></li>;
    }, turn.optional || []);
    let optionalList = <ul>{optionals}</ul>;

    return (
      <React.Fragment key={`turn-${turn.name}`}>
        <dt>{turn.name}</dt>
        <dd>{stepsList}</dd>
        {turn.optional && <dd>{optionalList}</dd>}
      </React.Fragment>
    );
  }, turns || []);

  return (
    <Color context="companies">
      {(c, t, _, p) => (
        <div className={`cutlines${minor ? " cutlines--minor" : ""}${halfWidthCharters ? " cutlines--half" : ""}`}>
          <div className={`charter ${minor ? "charter--minor " : ""}charter--${charterStyle}${halfWidthCharters ? " charter--half" : ""}`}>
            <div className="charter__bleed"
                 style={{
                   backgroundColor: p(backgroundColor || "white")
                 }}>
              <div
                className="charter__hr"
                style={{
                  backgroundColor: c(charterStyle === "color" ? color : (color === "white" ? "black" : color)),
                  borderBottom: ((charterStyle === "color" && (color === "white" || blackBand)) ? "2px solid black" : null)
                }}
              />
              <div className="charter__body">
                <div style={{ color: t(c(charterStyle === "color" ? color : "white")),
                              paddingRight: halfWidthCharters ? null : unitsToCss(12.5 + (65 * tokens.length)) }}
                     className="charter__name"><div>{name}</div></div>
                {charterStyle === "color" && (
                  <div className="charter__logo">
                    <svg viewBox="-37.5 -37.5 75 75">
                      <ColorContext.Provider value="companies">
                        <CompanyToken outline={color === "white" ? "black" : "white"}
                                      company={company}
                                      width={37.5} />
                      </ColorContext.Provider>
                    </svg>
                  </div>
                )}
                {false && <div className="charter__game">{game}</div>}
                <div className="charter__tokens">
                  {halfWidthCharters && "Tokens"}
                  {tokenSpots}
                </div>
                {halfWidthCharters && (
                  <div className="charter__assets">
                    Assets
                    <dl>{minor || turnNodes}</dl>
                  </div>
                )}
                {halfWidthCharters || (
                  <div className="charter__trains">
                    Trains
                    <div className="charter__phase">
                      <Phase phases={phases}
                             trains={trains}
                             minor={!!minor}
                             company={company.abbrev} />
                    </div>
                  </div>
                )}
                {halfWidthCharters || (
                  <div className="charter__treasury">
                    Treasury
                    {company.capital && (
                      <div className="charter__capital">
                        <Currency value={company.capital} type="treasury"/>
                      </div>
                    )}
                    <dl>{minor || turnNodes}</dl>
                  </div>
                )}
                {variant && <div className="charter__variant">{variant}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </Color>
  );
};

export default Charter;
