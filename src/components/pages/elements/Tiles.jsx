import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import Pagination from "@mui/material/Pagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import {
  filter,
  is,
  map,
  max,
  min,
  reduce,
  split,
  splitEvery,
  values,
} from "ramda";

import Svg from "@/components/Svg";
import Tile from "@/components/Tile";
import TileFilters from "@/components/TileFilters";
import { tiles } from "@/data";
import { useIntParam, useRangeParam, useStringParam } from "@/util/query";

const PER_PAGE = 50;
const revenues = reduce(
  ([minRevenue, maxRevenue], tile) => {
    if (!tile.values) {
      // No values on this tile, just return
      return [minRevenue, maxRevenue];
    }

    let [minTile, maxTile] = reduce(
      ([minRevenue, maxRevenue], value) => {
        return [
          min(minRevenue, parseInt(value.value)),
          max(maxRevenue, parseInt(value.value)),
        ];
      },
      [Number.MAX_SAFE_INTEGER, 0],
      tile.values,
    );

    return [min(minRevenue, minTile), max(maxRevenue, maxTile)];
  },
  [Number.MAX_SAFE_INTEGER, 0],
  values(tiles),
);

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },
  },
  filter: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: theme.spacing(2),

    "& > div": {
      marginRight: theme.spacing(2),
    },
  },
}));

const Tiles = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [page, setPage] = useIntParam("page", 1);
  const [color, setColor] = useStringParam("color", "all");
  const [id, setId] = useStringParam("id", "");
  const [includes, setIncludes] = useStringParam("includes", "all");
  const [revenue, setRevenue] = useRangeParam("revenue", revenues);

  const filteredTiles = useMemo(
    () =>
      splitEvery(
        PER_PAGE,
        filter((t) => {
          if (color !== "all" && t.color !== color) {
            return false;
          }

          if (id !== "" && !t.id.startsWith(id)) {
            return false;
          }

          if (includes !== "all") {
            let counts = {
              city: (t.cities || []).length,
              town: (t.towns || []).length + (t.centerTowns || []).length,
            };

            if (includes === "none" && (counts["city"] || counts["town"])) {
              return false;
            }

            if (includes === "city" && !counts["city"]) {
              return false;
            }

            if (includes === "town" && !counts["town"]) {
              return false;
            }
          }

          for (let i = 0; i < (t.values || []).length; i++) {
            let rawValue = t.values[i].value;
            let splitValues = split(
              /\D+/,
              is(String, rawValue) ? rawValue : rawValue.toString(),
            );
            for (let j = 0; j < splitValues.length; j++) {
              let value = parseInt(splitValues[j]);

              if (value >= revenue[0] && value <= revenue[1]) {
                return true;
              }
            }
          }

          if (!t.values && 0 >= revenue[0] && 0 <= revenue[1]) {
            return true;
          }

          return false;
        }, values(tiles)),
      ),
    [revenue, color, id, includes],
  );

  const pageCount = filteredTiles.length;
  const effectivePage = min(pageCount, page);
  const pagedTiles = filteredTiles[effectivePage - 1] || [];

  return (
    <Container maxWidth="lg">
      <Paper data-testid="tiles" elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>
          {t("elements.tiles.title")}
        </Typography>
        <Typography variant="body1">
          {t("elements.tiles.page.description")}
        </Typography>
      </Paper>
      <TileFilters
        {...{
          color,
          setColor,
          id,
          setId,
          includes,
          setIncludes,
          revenue,
          setRevenue,
          revenues,
        }}
      />
      <Container sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          size="large"
          color="primary"
          page={effectivePage}
          count={pageCount}
          onChange={(_, value) => setPage(value)}
        />
      </Container>
      <Grid container spacing={2}>
        {map(
          (t) => (
            <Grid
              key={t.id}
              size={{ xs: 6, sm: 4, md: 4, lg: 3 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Svg
                width="200"
                height="200"
                viewBox="-100 -100 200 200"
                transform="rotate(-90)"
              >
                <Tile id={t.id} width={150} x={0} y={0} />
              </Svg>
            </Grid>
          ),
          pagedTiles,
        )}
      </Grid>
    </Container>
  );
};

export default Tiles;
