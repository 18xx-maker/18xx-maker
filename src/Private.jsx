import React from "react";

const Private = ({ name, price, revenue, players, description }) => {
  return (
    <div class="cutlines">
      <div class="card private">
        <div class="private__name">{name}</div>
        <div class="private__description">{description}</div>
        <div class="private__price">{price}</div>
        {players && <div class="private__players">Players: {players}</div>}
        <div class="private__revenue">Income: {revenue}</div>
      </div>
    </div>
  );
};

export default Private;
