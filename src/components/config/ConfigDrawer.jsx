import { useLocation, useNavigate } from "react-router";

import Drawer from "@mui/material/Drawer";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";

import Config from "@/components/config/Config";
import {
  Button,
  ChevronRight as ChevronRightIcon,
  Settings as ConfigIcon,
  Fab,
  Toolbar,
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
      <Slide direction="left" in={true}>
        <Tooltip
          title="Config"
          aria-label="config"
          placement="left"
          arrow
          slotProps={{ popper: { "data-testid": "tooltip" } }}
        >
          <Fab
            data-testid="config-fab"
            className={styles.configButton}
            color="secondary"
            onClick={toggleConfig}
          >
            <ConfigIcon />
          </Fab>
        </Tooltip>
      </Slide>
      <Drawer
        data-testid="config-drawer"
        variant="persistent"
        anchor="right"
        open={visible}
        transitionDuration={300}
        PaperProps={{ className: styles.configDrawer }}
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
