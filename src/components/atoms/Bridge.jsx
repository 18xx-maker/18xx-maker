import Currency from "@/components/Currency";
import Triangle from "@/components/atoms/shapes/Triangle";

import PhaseContext from "@/context/PhaseContext";

const Bridge = (props) => {
  let { cost } = props;

  return (
    <PhaseContext.Provider value="default">
      <Triangle
        color="water"
        width={44}
        fontSize={11}
        reverse={true}
        {...props}
        text={<Currency value={cost} type="terrain" />}
      />
    </PhaseContext.Provider>
  );
};

export default Bridge;
