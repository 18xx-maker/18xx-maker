import { Trans, useTranslation } from "react-i18next";

import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import gtgLogo from "@/data/publishers/gtg.png";

const useStyles = makeStyles((theme) => ({
  page: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),

    "& h5": {
      padding: theme.spacing(0, 0, 2, 0),
    },

    "& ul": {
      margin: theme.spacing(0, 0, 2, 0),
    },

    "& p": {
      padding: theme.spacing(0, 0, 2, 0),
      "&:last-child": {
        padding: 0,
      },
    },

    "& a": {
      textDecoration: "underline",
    },
  },
  Alert: {
    margin: theme.spacing(0, 0, 2, 0),
  },
}));

const Home = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Container maxWidth="md">
      <Paper data-testid="home" elevation={5} className={classes.page}>
        <Typography variant="body1">{t("about")}</Typography>
        <Alert severity="warning" className={classes.Alert}>
          <strong>{t("important")}: </strong>
          {t("piracy")}
        </Alert>
        <Alert severity="info" className={classes.Alert}>
          <strong>{t("note")}: </strong>
          <Trans
            i18nKey="wip.note"
            components={{
              github: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/18xx-maker/18xx-maker/issues"
                  underline="hover"
                />
              ),
            }}
          />
        </Alert>
        <Typography variant="h5">{t("gtg.title")}</Typography>
        <Typography variant="body1">
          <img
            alt={`Grand Trunk Games Logo`}
            src={gtgLogo}
            style={{ float: "right", padding: "0 0 0 1em" }}
          />
          <Trans
            i18nKey="gtg.description"
            components={{
              gtg: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.grandtrunkgames.com/"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
        <Typography variant="h5">{t("usage.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="usage.description"
            components={{
              public: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://18xx-maker.com"
                  underline="hover"
                />
              ),
              app: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/18xx-maker/18xx-maker/releases"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
        <Typography variant="h5">{t("oss.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="oss.description"
            components={{
              license: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme"
                  underline="hover"
                />
              ),
              code: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/18xx-maker/18xx-maker"
                  underline="hover"
                />
              ),
              github: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/"
                  underline="hover"
                />
              ),
              netlify: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://netlify.com/"
                  underline="hover"
                />
              ),
              site: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://18xx-maker.com/"
                  underline="hover"
                />
              ),
              sb: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://storybook.18xx-maker.com/"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
        <Typography variant="h5">{t("features.title")}</Typography>
        <Typography variant="body1" component="div">
          <ul>
            <li>{t("features.1")}</li>
            <li>{t("features.2")}</li>
            <li>{t("features.3")}</li>
            <li>{t("features.4")}</li>
            <li>
              <strong>{t("features.browser.label")}:</strong>{" "}
              {t("features.browser.1")}
            </li>
            <li>
              <strong>{t("features.app.label")}:</strong> {t("features.app.1")}
            </li>
            <li>
              <strong>{t("features.app.label")}:</strong> {t("features.app.2")}
            </li>
            <li>
              <strong>{t("features.app.label")}:</strong> {t("features.app.3")}
            </li>
          </ul>
        </Typography>
        <Typography variant="h5">{t("donations.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="donations.description"
            components={{
              paypal: (
                <Link
                  rel="noreferrer"
                  target="_blank"
                  href="https://paypal.me/kelsin"
                />
              ),
              cash: (
                <Link
                  rel="noreferrer"
                  target="_blank"
                  href="https://cash.app/$kelsin"
                />
              ),
              venmo: (
                <Link
                  rel="noreferrer"
                  target="_blank"
                  href="https://account.venmo.com/u/kelsin13"
                />
              ),
            }}
          />
        </Typography>
        <Typography variant="h5">{t("analytics.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="analytics.description"
            components={{
              plausible: (
                <Link
                  rel="noreferrer"
                  target="_blank"
                  href="https://plausible.io/"
                />
              ),
            }}
          />
        </Typography>
      </Paper>
    </Container>
  );
};

export default Home;
