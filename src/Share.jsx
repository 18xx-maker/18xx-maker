import React from "react";
import Token from "./Token";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";

import is from "ramda/es/is";

const Share = ({
  cost,
  revenue,
  shares,
  percent,
  label,
  name,
  abbrev,
  token
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  return (
    <div className="cutlines">
      <div className="card share">
        {shares && <div className="share__shares">{count}</div>}
        {cost && <div className="share__shares">{cost}</div>}
        {percent && <div className="share__percent">{percent}%</div>}
        {revenue && <div className="share__percent">Revenue: {revenue}</div>}
        <div className="share__token">
          <ColorContext.Provider value="companies">
            <svg>
              <Token label={abbrev} token={token} width={25} />
            </svg>
          </ColorContext.Provider>
        </div>
        <Color context="companies">
          {(c,t) => (
            <div className="share__hr" style={{ backgroundColor: c(is(Object,token) ? token.colors[0] : token) }} />
          )}
        </Color>
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
  );
};

export default Share;
