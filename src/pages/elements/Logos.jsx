import React, { Suspense } from "react";

import { useTranslation } from "react-i18next";

import logos from "../../data/logos";

import ascend from "ramda/src/ascend";
import groupBy from "ramda/src/groupBy";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import prop from "ramda/src/prop";
import sort from "ramda/src/sort";
import values from "ramda/src/values";

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
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

const Logos = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const groups = groupBy(prop('group'), values(logos));

  const groupNodes = map(group => {
    const groupLogos = groups[group];

    const logoNodes = map(logo => {
      let Component = logo.Component;
      return (
        <Grid key={`logo-${logo.group}-${logo.name}`} item
              xs={6} sm={4} lg={2}
              style={{overflow: 'hidden'}}>
          <Suspense fallback={null}>
            <Component width="100%" height="100px"/>
          </Suspense>
          <Typography variant="subtitle1" align="center">
            {`${logo.group === undefined ? "" : `${logo.group}/`}${logo.name}`}
          </Typography>
        </Grid>
      )
    }, groupLogos);

    return (
      <React.Fragment key={`group-${group}`}>
        {group === "undefined" || (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>{group}</Typography>
          </Grid>
        )}
        {logoNodes}
      </React.Fragment>
    );
  }, sort(ascend(x => x === "undefined" ? "" : x), keys(groups)));

  return (
    <Container maxWidth="lg">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>{t('elements.logos.title')}</Typography>
        <Typography variant="body1">{t('elements.logos.page.description')}</Typography>
      </Paper>
      <Grid container spacing={2}>
        {groupNodes}
      </Grid>
    </Container>
  );
}

export default Logos;
