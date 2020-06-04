import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { tiles } from "@18xx-maker/games";

import { useRangeParam, useStringParam } from "../../util/query";

import Svg from "../../Svg";
import Tile from "../../Tile";

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';

import filter from "ramda/src/filter";
import map from "ramda/src/map";
import max from "ramda/src/max";
import min from "ramda/src/min";
import reduce from "ramda/src/reduce";
import uniq from "ramda/src/uniq";
import values from "ramda/src/values";

// import tiles from "../../data/tiles";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    '& p': {
      marginBottom: theme.spacing(2)
    }
  },
  filter: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(2),

    '& > div': {
      marginRight: theme.spacing(2)
    }
  }
}));

const colors = uniq(values(map(t => t.color, tiles)));

const revenues = reduce(([minRevenue, maxRevenue], tile) => {
  if (!tile.values) {
    // No values on this tile, just return
    return [min(minRevenue, 0), max(maxRevenue, 0)];
  }

  let [minTile, maxTile] = reduce(([minRevenue, maxRevenue], value) => {
    return [min(minRevenue, value.value), max(maxRevenue, value.value)];
  }, [Number.MAX_SAFE_INTEGER, 0], tile.values);

  return [min(minRevenue, minTile), max(maxRevenue, maxTile)];
}, [Number.MAX_SAFE_INTEGER, 0], values(tiles));

const Tiles = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [color, setColor] = useStringParam('color', 'all');
  const handleColor = (e) => setColor(e.target.value);

  const [id, setId] = useStringParam('id', '');
  const handleId = (e) => setId(e.target.value);

  const [includes, setIncludes] = useStringParam('includes', 'all');
  const handleIncludes = (e) => setIncludes(e.target.value);

  const [revenue, setRevenue, blurRevenue] = useRangeParam('revenue', revenues);
  const handleRevenue = (_, values) => setRevenue(values);

  const filteredTiles = filter(t => {
    if (color !== "all" && t.color !== color) {
      return false;
    }

    if (id !== "" && t.id !== id) {
      return false;
    }

    if (includes !== "all") {
      let counts = {
        "city": (t.cities || []).length,
        "town": (t.towns || []).length + (t.centerTowns || []).length
      }

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
      let value = t.values[i].value;

      if (value >= revenue[0] && value <= revenue[1]) {
        return true;
      }
    }

    if (!t.values && 0 >= revenue[0] && 0 <= revenue[1]) {
      return true;
    }

    return false;
  }, values(tiles));

  return (
    <Container maxWidth="lg">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>{t('elements.tiles.title')}</Typography>
        <Typography variant="body1">{t('elements.tiles.page.description')}</Typography>
      </Paper>
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h6" gutterBottom>{t('elements.tiles.filter.title')}</Typography>
        <Box className={classes.filter}>
          <FormControl variant="filled">
            <InputLabel id="filter-color-label">{t('elements.tiles.filter.color')}</InputLabel>
            <Select labelId="filter-color-label"
                    id="filter-color"
                    style={{width: 150}}
                    value={color}
                    onChange={handleColor}>
              <MenuItem value="all">{t('elements.tiles.filter.all')}</MenuItem>
              {map(c => <MenuItem key={c} value={c}>{c}</MenuItem>, colors)}
            </Select>
          </FormControl>
          <TextField id="filter-id"
                     label={t('elements.tiles.filter.id')}
                     style={{width: 150}}
                     value={id}
                     onChange={handleId}
                     variant="filled" />
          <FormControl variant="filled">
            <InputLabel id="filter-includes-label">{t('elements.tiles.filter.includes')}</InputLabel>
            <Select labelId="filter-includes-label"
                    id="filter-color"
                    style={{width: 150}}
                    value={includes}
                    onChange={handleIncludes}>
              <MenuItem value="all">{t('elements.tiles.filter.all')}</MenuItem>
              <MenuItem value="none">{t('elements.tiles.filter.none')}</MenuItem>
              <MenuItem value="town">{t('elements.tiles.filter.town')}</MenuItem>
              <MenuItem value="city">{t('elements.tiles.filter.city')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="filter-revenue-label">{t('elements.tiles.filter.revenues')}</InputLabel>
            <Slider
              style={{width: '200px'}}
              value={revenue}
              onChange={handleRevenue}
              onBlur={blurRevenue}
              step={10}
              min={revenues[0]}
              max={revenues[1]}
              marks={true}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              getAriaValueText={r => `Revenue from ${r[0]} to ${r[1]}`}
            />
          </FormControl>
        </Box>
      </Paper>
      <Grid container spacing={2}>
        {map(t => (
          <Grid item xs={6} sm={4} md={4} lg={3}>
            <Svg key={t.id}
                 width="200"
                 height="200"
                 viewBox="-100 -100 200 200"
                 transform="rotate(-90)">
              <Tile id={t.id} width={150} x={0} y={0} />
            </Svg>
          </Grid>
        ), filteredTiles)}
      </Grid>
    </Container>
  );
}

export default Tiles;
