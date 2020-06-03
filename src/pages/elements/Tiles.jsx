import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    '& p': {
      marginBottom: theme.spacing(2)
    }
  }
}));

const Atoms = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>{t('elements.tiles.title')}</Typography>
        <Typography variant="body1">{t('elements.tiles.page.description')}</Typography>
      </Paper>
    </Container>
  );
}

export default Atoms;
