import Currency from "@/components/Currency";
import Triangle from "@/components/atoms/shapes/Triangle";
import PhaseContext from "@/context/PhaseContext";

const Tunnel = (props) => {
  let { cost } = props;

  return (
    <PhaseContext.Provider value="default">
      <Triangle
        color="mountain"
        width={44}
        fontSize={11}
        {...props}
        text={<Currency value={cost} type="terrain" />}
      />
    </PhaseContext.Provider>
  );
};

export default Tunnel;
