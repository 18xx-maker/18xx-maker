import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import DownloadIcon from "@mui/icons-material/Download";
import CheckIcon from "@mui/icons-material/Replay";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { prop } from "ramda";

import { logos } from "@/data";
import { createDownloadPercent } from "@/state";

const useStyles = makeStyles((theme) => ({
  versions: {
    width: "inherit",
    "& svg, & img": {
      display: "block",
    },
    "& td": {
      padding: theme.spacing(0.5),

      "&:first-child": {
        paddingLeft: theme.spacing(2),
      },
    },
    "& th": {
      fontWeight: "bold",
    },
  },
  page: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),

    "& h4": {
      padding: theme.spacing(0, 0, 2, 0),
    },

    "& h5": {
      padding: theme.spacing(0, 0, 2, 0),
    },

    "& p": {
      padding: theme.spacing(0, 0, 2, 0),
      "&:last-child": {
        padding: 0,
      },
    },

    "& p > code": {
      fontSize: "0.9rem",
      display: "block",
    },

    "& p:has(+ pre)": {
      padding: 0,
    },

    "& pre": {
      padding: theme.spacing(0, 0, 2, 0),
      margin: 0,
      "&:last-child": {
        padding: 0,
      },
    },
  },
}));

const ChromeIcon = () => {
  const Component = logos["webdev/chrome"];
  return <Component width="24" height="24" />;
};

const ElectronIcon = () => {
  const Component = logos["webdev/electron"];
  return <Component width="24" height="24" />;
};

const PlatformIcon = ({ platform }) => {
  let Component;
  switch (platform) {
    case "darwin":
      Component = logos["dev/apple"];
      break;
    case "win32":
      Component = logos["dev/microsoft"];
      break;
    case "linux":
      Component = logos["dev/linux"];
      break;
    default:
      return null;
  }

  return <Component width="24" height="24" />;
};

const Update = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const update = useSelector(prop("update"));

  const checkForUpdates = () => {
    window.api.checkForUpdates();
  };

  const quitAndInstall = () => {
    dispatch(createDownloadPercent(0));
    window.api.downloadUpdate();
  };

  if (!update) {
    return null;
  }

  if (update.checking) {
    return <CircularProgress />;
  }

  if (update.downloading !== undefined) {
    return <LinearProgress variant="determinate" value={update.downloading} />;
  }

  if (!update.available && update.dev) {
    return <Typography variant="body1">{t("app.updates.dev")}</Typography>;
  }

  if (!update.available) {
    return (
      <>
        <Typography variant="body1">
          {update.error
            ? t("app.updates.error")
            : t("app.updates.latest", { version: update.info.version })}
        </Typography>
        <Typography variant="body1">
          <Button
            startIcon={<CheckIcon />}
            variant="contained"
            onClick={checkForUpdates}
          >
            {t("app.updates.check")}
          </Button>
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography variant="body1">
        {t("app.updates.available", { version: update.info.version })}
      </Typography>
      <Typography variant="body1">
        <Button
          startIcon={<DownloadIcon />}
          variant="contained"
          onClick={quitAndInstall}
        >
          {t("app.updates.update")}
        </Button>
      </Typography>
    </>
  );
};

const App = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [data, setData] = useState();

  useEffect(() => {
    window.api.loadConfig().then(setData);
  }, []);

  return (
    <Container maxWidth="md">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4">{t("app.title")}</Typography>
        {data && (
          <Table size="small" className={classes.versions}>
            <TableHead>
              <TableRow>
                <TableCell colSpan="2">{t("app.versions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="right">
                  <PlatformIcon platform={data.platform} />
                </TableCell>
                <TableCell>{data.versions.system}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">
                  <ElectronIcon />
                </TableCell>
                <TableCell>{data.versions.electron}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">
                  <ChromeIcon />
                </TableCell>
                <TableCell>{data.versions.chrome}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">
                  <img src="./logo.png" width="24" height="24" />
                </TableCell>
                <TableCell>{data.versions.app}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Paper>
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4">{t("app.updates.title")}</Typography>
        <Update />
      </Paper>
      {data && (
        <Paper elevation={5} className={classes.page}>
          <Typography variant="body1">
            {t("app.config.what")} <strong>{t("app.config.tamper")}</strong>
          </Typography>
          <Typography variant="body1">
            {t("app.config.file")} <code>{data.path}</code>
          </Typography>
          <Typography variant="body1">{t("app.config.current")}</Typography>
          <pre>
            <code>{JSON.stringify(data.config, null, 2)}</code>
          </pre>
        </Paper>
      )}
    </Container>
  );
};
export default App;
