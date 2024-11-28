import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { ascend, compose, groupBy, keys, map, nth, sort, split } from "ramda";

import { logos } from "@/data";
import { useStringParam } from "@/util/query";

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },
  },
}));

const groupFor = compose(nth(0), split("/"));
const nameFor = compose(nth(1), split("/"));
const groups = groupBy(groupFor, keys(logos));
const groupNames = sort(
  ascend((x) => (x === "undefined" ? "" : x)),
  keys(groups),
);

const groupItems = map(
  (group) => (
    <MenuItem key={group} value={group}>
      {group}
    </MenuItem>
  ),
  groupNames,
);

const Logos = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [group, setGroup] = useStringParam("group", groupNames[0]);

  const logoNodes = useMemo(
    () =>
      map((logo) => {
        let name = nameFor(logo);
        let Component = logos[logo];
        return (
          <Grid
            key={`logo-${group}-${name}`}
            size={{ xs: 6, sm: 4, lg: 2 }}
            style={{ overflow: "hidden" }}
          >
            <Component width="100%" height="100px" />
            <Typography variant="subtitle1" align="center">
              {logo}
            </Typography>
          </Grid>
        );
      }, groups[group]),
    [group],
  );

  return (
    <Container maxWidth="lg">
      <Paper data-testid="logos" elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>
          {t("elements.logos.title")}
        </Typography>
        <Typography variant="body1">
          {t("elements.logos.page.description")}
        </Typography>
      </Paper>
      <Container
        sx={{ paddingBottom: 2, display: "flex", justifyContent: "center" }}
      >
        <Select value={group} onChange={(e) => setGroup(e.target.value)}>
          {groupItems}
        </Select>
      </Container>
      <Grid container spacing={2}>
        {logoNodes}
      </Grid>
    </Container>
  );
};

export default Logos;
