import Triangle from "@/atoms/shapes/Triangle";
import PhaseContext from "@/context/PhaseContext";
import Currency from "@/util/Currency";

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
