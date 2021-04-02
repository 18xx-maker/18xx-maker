import React from "react";
import { Trans, useTranslation } from "react-i18next";

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const gtgLogo = require(`../data/publishers/gtg.png`);

const useStyles = makeStyles((theme) => ({
  page: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),

    "& h5": {
      padding: theme.spacing(0, 0, 2, 0)
    },

    "& ul": {
      margin: theme.spacing(0, 0, 2, 0)
    },
   
    "& p": {
      padding: theme.spacing(0, 0, 2, 0),
      "&:last-child": {
        padding: 0
      }
    }
  },
  Alert: {
    margin: theme.spacing(0, 0, 2, 0)
  }
}));

const Home = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Container maxWidth="md">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="body1">{t('about')}</Typography>
        <Alert severity="warning" className={classes.Alert}>
          <strong>{t('important')}: </strong>
          {t('piracy')}
        </Alert>
        <Alert severity="info" className={classes.Alert}>
          <strong>{t('note')}: </strong>
          <Trans i18nKey="wip.note"
                 components={{github: <Link target="_blank" rel="noreferrer" href="https://github.com/18xx-maker/18xx-maker/issues" /> }} />
        </Alert>
        <Typography variant="h5">{t('gtg.title')}</Typography>
        <Typography variant="body1">
          <img alt={`Grand Trunk Games Logo`} src={gtgLogo} style={{"float": "left", "padding": "0.5em 1em 1em 0"}} />
          <Trans i18nKey="gtg.description"
                 components={{gtg: <Link target="_blank" rel="noreferrer" href="https://www.grandtrunkgames.com/" />}} />
        </Typography>
        <Typography variant="h5">{t('usage.title')}</Typography>
        <Typography variant="body1">
          <Trans i18nKey="usage.description"
                 components={{public: <Link target="_blank" rel="noreferrer" href="https://18xx-maker.com" />,
                              app: <Link target="_blank" rel="noreferrer" href="https://github.com/18xx-maker/18xx-maker/releases"/> }} />
        </Typography>
        <Typography variant="h5">{t('features.title')}</Typography>
        <Typography variant="body1" component="div">
          <ul>
            <li>{t('features.1')}</li>
            <li>{t('features.2')}</li>
            <li>{t('features.3')}</li>
            <li>{t('features.4')}</li>
            <li><strong>{t('browser')}:</strong> {t('features.browser.1')}</li>
            <li><strong>{t('app')}:</strong> {t('features.app.1')}</li>
            <li><strong>{t('app')}:</strong> {t('features.app.2')}</li>
            <li><strong>{t('app')}:</strong> {t('features.app.3')}</li>
          </ul>
        </Typography>
        <Typography variant="h5">{t('donations.title')}</Typography>
        <Typography variant="body1">
          <Trans i18nKey="donations.description"
                 components={{ paypal: <Link rel="noreferrer" target="_blank" href="https://paypal.me/kelsin" />,
                               cash: <Link rel="noreferrer" target="_blank" href="https://cash.app/$kelsin" /> }} />
        </Typography>
      </Paper>
    </Container>
  );
};

export default Home;
