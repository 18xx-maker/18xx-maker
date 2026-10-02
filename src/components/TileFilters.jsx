import { useState } from "react";
import { useTranslation } from "react-i18next";

import Slider from "@mui/material/Slider";

import { map, uniq, values } from "ramda";

import { tiles } from "@/data";
import { Paper, Select, TextField, Typography } from "@/ui";
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
      <div className={styles.filter}>
        <Select
          id="filter-color"
          label={t("elements.tiles.filter.color")}
          style={{ width: 150 }}
          value={color}
          onChange={handleColor}
          options={[
            { value: "all", label: t("elements.tiles.filter.all") },
            ...map((c) => ({ value: c, label: c }), colors),
          ]}
        />
        <TextField
          id="filter-id"
          label={t("elements.tiles.filter.id")}
          style={{ width: 150 }}
          value={id}
          onChange={handleId}
        />
        <Select
          id="filter-includes"
          label={t("elements.tiles.filter.includes")}
          style={{ width: 150 }}
          value={includes}
          onChange={handleIncludes}
          options={[
            { value: "all", label: t("elements.tiles.filter.all") },
            { value: "none", label: t("elements.tiles.filter.none") },
            { value: "town", label: t("elements.tiles.filter.town") },
            { value: "city", label: t("elements.tiles.filter.city") },
          ]}
        />
        <div className={styles.slider}>
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
        </div>
      </div>
    </Paper>
  );
};
export default TileFilters;
