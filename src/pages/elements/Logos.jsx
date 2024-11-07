import React from "react";

import { useTranslation } from "react-i18next";

import { ascend, compose, groupBy, keys, map, nth, sort, split } from "ramda";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import makeStyles from "@mui/styles/makeStyles";

import { logos } from "../../data";

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },
  },
}));

const groupFor = compose(nth(0), split("/"));
const nameFor = compose(nth(1), split("/"));
const groups = groupBy(groupFor, keys(logos));

const Logos = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const groupNodes = map(
    (group) => {
      const groupLogos = groups[group];

      const logoNodes = map((logo) => {
        let name = nameFor(logo);
        let Component = logos[logo];
        return (
          <Grid
            key={`logo-${group}-${name}`}
            item
            xs={6}
            sm={4}
            lg={2}
            style={{ overflow: "hidden" }}
          >
            <Component width="100%" height="100px" />
            <Typography variant="subtitle1" align="center">
              {logo}
            </Typography>
          </Grid>
        );
      }, groupLogos);

      return (
        <React.Fragment key={`group-${group}`}>
          {group === "undefined" || (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {group}
              </Typography>
            </Grid>
          )}
          {logoNodes}
        </React.Fragment>
      );
    },
    sort(
      ascend((x) => (x === "undefined" ? "" : x)),
      keys(groups),
    ),
  );

  return (
    <Container maxWidth="lg">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>
          {t("elements.logos.title")}
        </Typography>
        <Typography variant="body1">
          {t("elements.logos.page.description")}
        </Typography>
      </Paper>
      <Grid container spacing={2}>
        {groupNodes}
      </Grid>
    </Container>
  );
};

export default Logos;
