import React from "react";
import CompanyToken from "../tokens/CompanyToken";
import Color from "../data/Color";
import ColorContext from "../context/ColorContext";

import Config from "../data/Config";

import is from "ramda/src/is";
import min from "ramda/src/min";

import "./share.scss";

const LeftShare = ({
  cost,
  revenue,
  shares,
  percent,
  label,
  logo,
  name,
  abbrev,
  token,
  color,
  shareStyle,
  company
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  let tokens = [];
  let sharesLeft = shares;
  while(sharesLeft > 0) {
    tokens.push(<div key={sharesLeft} className="share__token">
                  <div className="share__token__wrapper">
                    <svg style={{width:"0.52in",height:"0.52in"}}
                         viewBox="-26 -26 52 52">
                      <CompanyToken company={company}
                                    outline={shareStyle === "gmt" ? (company.color === "white" ? "black" : "white") : null} />
                    </svg>
                  </div>
                </div>);
    sharesLeft -= 1;
  }

  return (
    <div className="cutlines">
      <div className={`card share share--${shareStyle || "left"}`}>
        <div className="card__bleed">
          <Color context="companies">
            {(c,t) => (
              <div className="share__hr" style={{ backgroundColor: c(is(Object,token) ? token.colors[0] : token) }} />
            )}
          </Color>
          <div className="card__body">
            {name && <div className="share__name"><div>{name}</div></div>}
            {shares && <div className="share__shares">{count}</div>}
            {cost && <div className="share__shares">{cost}</div>}
            {percent && <div className="share__percent">{percent}%</div>}
            {revenue && <div className="share__percent">Revenue: {revenue}</div>}
            <div className="share__tokens">
              <ColorContext.Provider value="companies">
                {tokens}
              </ColorContext.Provider>
            </div>
            {label &&
             label.length > 0 && (
               <div className="share__label">
                 <Color context="map">
                   {(c,t) => (
                     <div className="share__label__text"
                          style={{ color: t(c("yellow")), backgroundColor: c("yellow") }} >
                       {label}
                     </div>
                   )}
                 </Color>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CenterShare = ({
  cost,
  revenue,
  shares,
  percent,
  label,
  logo,
  name,
  abbrev,
  token,
  company
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  let tokens = [];
  let sharesLeft = shares;
  while(sharesLeft > 0) {
    tokens.push(<div key={sharesLeft} className="share__token">
                  <div style={{width:`${min(1.0, sharesLeft) * 100}%`}}
                       className="share__token__wrapper">
                    <svg style={{width:"0.52in",height:"0.52in"}}
                         viewBox="-26 -26 52 52">
                      <CompanyToken company={company} />
                    </svg>
                  </div>
                </div>);
    sharesLeft -= 1;
  }

  return (
    <div className="cutlines">
      <div className="card share">
        <div className="card__bleed">
          <Color context="companies">
            {(c,t) => (
              <div className="share__hr" style={{ backgroundColor: c(is(Object,token) ? token.colors[0] : token) }} />
            )}
          </Color>
          <div className="card__body">
            {shares && <div className="share__shares">{count}</div>}
            {cost && <div className="share__shares">{cost}</div>}
            {percent && <div className="share__percent">{percent}%</div>}
            {revenue && <div className="share__percent">Revenue: {revenue}</div>}
            <div className="share__tokens">
              <ColorContext.Provider value="companies">
                {tokens}
              </ColorContext.Provider>
            </div>
            {label &&
             label.length > 0 && (
               <div className="share__label">
                 <Color context="map">
                   {(c,t) => (
                     <div className="share__label__text"
                          style={{ color: t(c("yellow")), backgroundColor: c("yellow") }} >
                       {label}
                     </div>
                   )}
                 </Color>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Share = (props) => (
  <Config>
    {config => {
      if(config.cards.shareStyle === "left") {
        return <LeftShare {...props} />;
      } else if (config.cards.shareStyle === "gmt") {
        return <LeftShare {...props} shareStyle="gmt" />;
      } else {
        return <CenterShare {...props} />;
      }
    }}
  </Config>
);
export default Share;
