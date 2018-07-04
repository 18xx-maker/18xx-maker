import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";
import Token from "./Token";

const Private = ({ name, price, revenue, description }) => {
  return (
    <div class="cutlines">
      <div class="card private">
        <div class="private__name">{name}</div>
        <div class="private__description">{description}</div>
        <div class="private__price">{price}</div>
        <div class="private__revenue">Income: {revenue}</div>
      </div>
    </div>
  );
};

export default Private;
