import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

import Alert from "@mui/material/Alert";

import gtgLogo from "@/data/publishers/gtg.png";
import { Container, Link, Paper, Typography } from "@/ui";
import capability from "@/util/capability";
import styles from "./Home.module.css";

const Home = () => {
  const { t } = useTranslation();
  return (
    <Container maxWidth="md">
      <Paper data-testid="home" elevation={5} className={styles.page}>
        <Typography variant="body1">{t("about")}</Typography>
        {capability.electron || (
          <>
            <Typography variant="h5">{t("electron.title")}</Typography>
            <Typography variant="body1">
              <Trans
                i18nKey="electron.description"
                components={{
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
          </>
        )}
        <Typography variant="h5">{t("started.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="started.description"
            components={{
              started: (
                <RouterLink
                  component={Link}
                  to="/docs"
                  href="/docs"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
        <Typography variant="h5">{t("discord.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="discord.description"
            components={{
              discord: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://discord.gg/gcYvAjYYfw"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
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
        <Typography variant="h5">{t("credits.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="credits.description"
            components={{
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
        <Typography variant="h5">{t("license.title")}</Typography>
        <Typography variant="body1">
          <Trans
            i18nKey="license.description"
            components={{
              license: (
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme"
                  underline="hover"
                />
              ),
            }}
          />
        </Typography>
        <Alert severity="warning" className={styles.alert}>
          <strong>{t("important")}: </strong>
          {t("piracy")}
        </Alert>
        <Typography variant="body1">{t("license.permission")}</Typography>
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
