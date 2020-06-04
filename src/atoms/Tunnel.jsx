import React from "react";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";
import Triangle from "./shapes/Triangle";

const Tunnel = (props) => {
  let { cost } = props;

  return (
    <PhaseContext.Provider value="default">
      <Triangle color="mountain"
                width={44}
                fontSize={11}
                {...props}
                text={<Currency value={cost} type="terrain"/>} />
    </PhaseContext.Provider>
  );
};

export default Tunnel;
