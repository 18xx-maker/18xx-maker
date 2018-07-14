import React from "react";

const Private = ({ name, price, revenue, players, description }) => {
  return (
    <div className="cutlines">
      <div className="card private">
        <div className="private__name">{name}</div>
        <div className="private__description">{description}</div>
        <div className="private__price">{price}</div>
        {players && <div className="private__players">Players: {players}</div>}
        <div className="private__revenue">Income: {revenue}</div>
      </div>
    </div>
  );
};

export default Private;
