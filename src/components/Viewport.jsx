import { useLocation } from "react-router";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import makeStyles from "@mui/styles/makeStyles";

import { useSideMenu } from "@/hooks/useSideMenu";
import { useBooleanParam } from "@/util/query";

const useStyles = makeStyles((theme) => ({
  viewport: {
    transitionProperty: "width, margin-left, margin-right",
    transitionDuration: theme.transitions.duration.shorter,
    transitionTimingFunction: theme.transitions.easing.sharp,
    overflow: "auto",
  },
}));

const Viewport = ({ sideNavOpen, children }) => {
  const needsSideMenu = useSideMenu();
  const classes = useStyles();
  const [print] = useBooleanParam("print");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const configOpen = searchParams.has("config");

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.up("md"));
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  let marginLeft = "0px";
  let marginRight = "0px";
  if (!print) {
    if (needsSideMenu && (isMedium || sideNavOpen)) {
      marginLeft = "300px";
    }
    if (configOpen) {
      if (isLarge) {
        marginRight = "35%";
      } else if (isSmall) {
        marginRight = "50%";
      }
    }
  }
  let width = `calc(100% - ${marginLeft} - ${marginRight})`;

  return (
    <Box
      className={classes.viewport}
      style={{ width, marginLeft, marginRight }}
    >
      {children}
    </Box>
  );
};

export default Viewport;
