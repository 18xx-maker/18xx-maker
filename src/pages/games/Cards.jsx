import CardsComponent from "../../cards";
import { useBooleanParam } from "../../util/query";

const Cards = () => {
  const [hidePrivates] = useBooleanParam("hidePrivates");
  const [hideShares] = useBooleanParam("hideShares");
  const [hideTrains] = useBooleanParam("hideTrains");
  const [hideNumbers] = useBooleanParam("hideNumbers");

  return (
    <CardsComponent
      {...{ hidePrivates, hideShares, hideTrains, hideNumbers }}
    />
  );
};

export default Cards;
