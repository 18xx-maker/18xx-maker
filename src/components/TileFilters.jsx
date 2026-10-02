import { useState } from "react";
import { useTranslation } from "react-i18next";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";

import { map, uniq, values } from "ramda";

import { tiles } from "@/data";
import { Box, Paper, Typography } from "@/ui";
import styles from "./TileFilters.module.css";

const colors = uniq(values(map((t) => t.color, tiles)));

const TileFilters = ({
  color,
  setColor,
  id,
  setId,
  includes,
  setIncludes,
  revenue,
  setRevenue,
  revenues,
}) => {
  const { t } = useTranslation();

  const [revenueSlider, setRevenueSlider] = useState(revenue);

  const handleColor = (e) => setColor(e.target.value);
  const handleId = (e) => setId(e.target.value);
  const handleIncludes = (e) => setIncludes(e.target.value);
  const handleRevenueCommit = (_, values) => {
    setRevenueSlider(values);
    setRevenue(values);
  };
  const handleRevenue = (_, values) => setRevenueSlider(values);

  return (
    <Paper elevation={5} className={styles.page}>
      <Typography variant="h6" gutterBottom>
        {t("elements.tiles.filter.title")}
      </Typography>
      <Box className={styles.filter}>
        <FormControl variant="filled">
          <InputLabel id="filter-color-label">
            {t("elements.tiles.filter.color")}
          </InputLabel>
          <Select
            labelId="filter-color-label"
            id="filter-color"
            style={{ width: 150 }}
            value={color}
            onChange={handleColor}
          >
            <MenuItem value="all">{t("elements.tiles.filter.all")}</MenuItem>
            {map(
              (c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ),
              colors,
            )}
          </Select>
        </FormControl>
        <TextField
          id="filter-id"
          label={t("elements.tiles.filter.id")}
          style={{ width: 150 }}
          value={id}
          onChange={handleId}
          variant="filled"
        />
        <FormControl variant="filled">
          <InputLabel id="filter-includes-label">
            {t("elements.tiles.filter.includes")}
          </InputLabel>
          <Select
            labelId="filter-includes-label"
            id="filter-color"
            style={{ width: 150 }}
            value={includes}
            onChange={handleIncludes}
          >
            <MenuItem value="all">{t("elements.tiles.filter.all")}</MenuItem>
            <MenuItem value="none">{t("elements.tiles.filter.none")}</MenuItem>
            <MenuItem value="town">{t("elements.tiles.filter.town")}</MenuItem>
            <MenuItem value="city">{t("elements.tiles.filter.city")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard">
          <Slider
            style={{ width: "200px" }}
            value={revenueSlider}
            onChange={handleRevenue}
            onChangeCommitted={handleRevenueCommit}
            step={10}
            min={revenues[0]}
            max={revenues[1]}
            marks={[
              { value: 0, label: "∅" },
              { value: 20, label: "20" },
              { value: 40, label: "40" },
              { value: 60, label: "60" },
              { value: 100, label: "100" },
              { value: revenues[1], label: revenues[1] },
            ]}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={(r) => `Revenue from ${r[0]} to ${r[1]}`}
          />
        </FormControl>
      </Box>
    </Paper>
  );
};
export default TileFilters;
