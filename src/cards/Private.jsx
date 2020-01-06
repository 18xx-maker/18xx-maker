import React from "react";

import Currency from "../util/Currency";

import "./private.scss";

const Private = ({ name, price, revenue, bid, icon, players, description }) => {
  return (
    <div className="cutlines">
      <div className="card private">
        <div className="card__bleed">
          <div className="card__body">
            {icon && <div className="private__icon">{icon}</div>}
            <div className="private__name">{name}</div>
            <div className="private__description">{description}</div>
            {bid && <div className="private__bid">Min Bid: {bid}</div>}
            <div className="private__price"><Currency value={price} type="private"/></div>
            {players && <div className="private__players">{players}</div>}
            {players && <div className="private__players">{players}</div>}
            {revenue && <div className="private__revenue">Revenue: <Currency value={revenue} type="private"/></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Private;
