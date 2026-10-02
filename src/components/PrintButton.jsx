import { useMatch } from "react-router";

import { useGame } from "@/hooks";
import { Fab, Print as PrintIcon, Tooltip } from "@/ui";
import { useBooleanParam } from "@/util/query";
import styles from "./fab.module.css";

const PrintButton = () => {
  const match = useMatch("/games/*");
  const game = useGame();
  const [print] = useBooleanParam("print");

  if (print || !game || !match) {
    return null;
  }

  const handler = () => {
    window.print();
  };

  return (
    <Tooltip title="Print" aria-label="print" placement="left" arrow>
      <Fab
        data-testid="print-fab"
        onClick={handler}
        className={styles.floating}
        color="primary"
      >
        <PrintIcon />
      </Fab>
    </Tooltip>
  );
};

export default PrintButton;
