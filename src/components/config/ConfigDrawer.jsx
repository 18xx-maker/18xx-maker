import { useLocation, useNavigate } from "react-router";

import Config from "@/components/config/Config";
import {
  Button,
  ChevronRight as ChevronRightIcon,
  Settings as ConfigIcon,
  Drawer,
  Fab,
  Toolbar,
  Tooltip,
} from "@/ui";
import { useBooleanParam } from "@/util/query";
import styles from "./ConfigDrawer.module.css";

const ConfigDrawer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [print] = useBooleanParam("print");
  const searchParams = new URLSearchParams(location.search);
  const visible = searchParams.has("config");

  if (print) {
    return null;
  }

  const toggleConfig = () => {
    if (visible) {
      searchParams.delete("config");
    } else {
      searchParams.set("config", true);
    }

    navigate({ search: searchParams.toString() });
  };

  return (
    <>
      <Tooltip title="Config" aria-label="config" placement="left" arrow>
        <Fab
          data-testid="config-fab"
          className={styles.configButton}
          color="secondary"
          onClick={toggleConfig}
        >
          <ConfigIcon />
        </Fab>
      </Tooltip>
      <Drawer
        data-testid="config-drawer"
        variant="persistent"
        anchor="right"
        open={visible}
        paperClassName={styles.configDrawer}
      >
        <Toolbar className={styles.configToolbar}>
          <Button startIcon={<ChevronRightIcon />} onClick={toggleConfig}>
            Close Config
          </Button>
        </Toolbar>
        <Config />
      </Drawer>
    </>
  );
};

export default ConfigDrawer;
