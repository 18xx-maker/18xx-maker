import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ascend, compose, groupBy, keys, map, nth, sort, split } from "ramda";

import { logos } from "@/data";
import { Container, Grid, Paper, Select, Typography } from "@/ui";
import { useStringParam } from "@/util/query";
import pageStyles from "../page.module.css";

const groupFor = compose(nth(0), split("/"));
const nameFor = compose(nth(1), split("/"));
const groups = groupBy(groupFor, keys(logos));
const groupNames = sort(
  ascend((x) => (x === "undefined" ? "" : x)),
  keys(groups),
);

const groupOptions = map(
  (group) => ({ value: group, label: group }),
  groupNames,
);

const Logos = () => {
  const { t } = useTranslation();
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
      <Paper data-testid="logos" elevation={5} className={pageStyles.page}>
        <Typography variant="h4" gutterBottom>
          {t("elements.logos.title")}
        </Typography>
        <Typography variant="body1">
          {t("elements.logos.page.description")}
        </Typography>
      </Paper>
      <Container maxWidth="lg" className={pageStyles.selector}>
        <Select
          variant="outlined"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          options={groupOptions}
        />
      </Container>
      <Grid container spacing={2}>
        {logoNodes}
      </Grid>
    </Container>
  );
};

export default Logos;
