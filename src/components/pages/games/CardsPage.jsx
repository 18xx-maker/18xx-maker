import CardsComponent from "@/components/cards";

import { useBooleanParam } from "@/util/query";

const CardsPage = () => {
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

export default CardsPage;
