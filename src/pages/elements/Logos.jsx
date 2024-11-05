import React, { Suspense } from "react";

import { useTranslation } from "react-i18next";

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

const logoComponents = import.meta.glob("../../data/logos/**/*.svg", { eager: true, query: '?react', import: 'default' });

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

const groupFor = (file) => {
  let match = file.match(/^\.\.\/\.\.\/data\/logos\/([^\/]+)\/.+\.svg$/);
  return match ? match[1] : "";
};

const nameFor = (file) => {
  let match = file.match(/\/([^\/]+)\.svg$/);
  return match ? match[1] : "";
};

const fullNameFor = (file) => {
  let match = file.match(/^\.\.\/\.\.\/data\/logos\/(.+)\.svg$/);
  return match ? match[1] : "";
};

const groups = groupBy(groupFor, keys(logoComponents));

const Logos = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const groupNodes = map(group => {
    const groupLogos = groups[group];

    const logoNodes = map(file => {
      let name = nameFor(file);
      let fullName = fullNameFor(file);
      let Component = logoComponents[file];
      return (
        <Grid key={`logo-${group}-${name}`} item
              xs={6} sm={4} lg={2}
              style={{overflow: 'hidden'}}>
          <Component width="100%" height="100px"/>
          <Typography variant="subtitle1" align="center">
            {fullName}
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
