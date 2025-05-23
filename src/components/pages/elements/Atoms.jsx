import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { addIndex, chain, find, map, propEq } from "ramda";

import Hex from "@/components/Hex";
import Svg from "@/components/Svg";
import { SyntaxHighlighter, style } from "@/components/SyntaxHighlighter";
import { useStringParam } from "@/util/query";

const atoms = [
  {
    group: "Hexes",
    examples: [
      { color: "plain" },
      { color: "offboard" },
      { color: "mountain" },
      { color: "water" },
      { color: "land", divides: [{ side: 3 }] },
      { color: "yellow" },
      { color: "green" },
      { color: "brown" },
      { color: "gray" },
      { color: "grey" },
      { color: "orange", divides: [{ side: 2 }] },
      { color: "yellow/green" },
      { color: "green/brown" },
      { color: "brown/gray" },
      { color: "red/yellow" },
      { color: "mountain", removeBorders: [1, 4] },
      { color: "water", removeBorders: [1, 3, 5] },
    ],
  },
  {
    group: "Values",
    examples: [
      { values: [{ value: 20 }] },
      { values: [{ value: 60, color: "orange", fontFamily: "Elegante" }] },
      { values: [{ value: 60, shape: "square" }] },
      {
        values: [
          {
            outerBorderColor: "green",
            value: 120,
          },
        ],
      },
      {
        values: [
          {
            outerBorderColor: "green",
            shape: "square",
            value: 120,
          },
        ],
      },
      { values: [{ value: 1024 }] },
      { values: [{ value: "60/60" }] },
      { values: [{ value: "Longer" }] },
    ],
  },
  {
    group: "Names",
    examples: [
      { names: [{ name: "Boston" }] },
      { names: [{ name: "Austin", percent: 0.6, angle: 240 }] },
      { names: [{ name: "Seattle", percent: 0.6, rotate: -60, angle: 120 }] },
      {
        names: [
          {
            name: "Los Angeles",
            fontFamily: "display",
            fontSize: 20,
            color: "yellow",
            strokeWidth: 1,
          },
        ],
      },
      {
        names: [
          {
            name: "Paris",
            fontFamily: "Elegante",
            fontSize: 16,
            fontWeight: "normal",
            fontStyle: "italic",
          },
        ],
      },
    ],
  },
  {
    group: "Industries",
    examples: [
      { industries: [{ top: 1, bottom: 20 }] },
      { industries: [{ top: "ZH", bottom: 10 }] },
    ],
  },
  {
    group: "Goods",
    examples: [
      { goods: [{}] },
      { goods: [{ color: "purple" }] },
      { goods: [{ color: "orange" }] },
    ],
  },
  {
    group: "Private Companies",
    examples: [
      { companies: [{ label: "A" }] },
      { companies: [{ label: "CdH", left: 50, right: 50, color: "blue" }] },
      { companies: [{ label: "C", left: 30, bottom: true }] },
      {
        companies: [{ label: "ERR", color: "orange", radius: 8, bottom: true }],
      },
    ],
  },
  {
    group: "Icons",
    examples: [
      { icons: [{ type: "boat" }] },
      { icons: [{ type: "boat", color: "lightBlue" }] },
      { icons: [{ type: "bridge" }] },
      { icons: [{ type: "cactus" }] },
      { icons: [{ type: "charter" }] },
      { icons: [{ type: "charter", color: "lightBlue" }] },
      { icons: [{ type: "coal" }] },
      { icons: [{ type: "coalcar" }] },
      { icons: [{ type: "cylinder" }] },
      { icons: [{ type: "cylinder", color: "lightBlue" }] },
      { icons: [{ type: "ferry" }] },
      { icons: [{ type: "fish" }] },
      { icons: [{ type: "fish", color: "lightBlue" }] },
      { icons: [{ type: "home" }] },
      { icons: [{ type: "home", color: "orange" }] },
      { icons: [{ type: "lock" }] },
      { icons: [{ type: "lock", color: "violet", label: "3" }] },
      { icons: [{ type: "mail" }] },
      { icons: [{ type: "mail", color: "orange" }] },
      { icons: [{ type: "meat" }] },
      { icons: [{ type: "meat", color: "orange" }] },
      { icons: [{ type: "medium-city" }] },
      { icons: [{ type: "mining" }] },
      { icons: [{ type: "mountain" }] },
      { icons: [{ type: "oil-derrick" }] },
      { icons: [{ type: "oilbarrel" }] },
      { icons: [{ type: "port" }] },
      { icons: [{ type: "port", color: "orange" }] },
      { icons: [{ type: "refinery" }] },
      { icons: [{ type: "river" }] },
      { icons: [{ type: "share" }] },
      { icons: [{ type: "share", color: "orange" }] },
      { icons: [{ type: "steamboat" }] },
      { icons: [{ type: "swamp" }] },
      { icons: [{ type: "token" }] },
      { icons: [{ type: "token", color: "lightBlue" }] },
      { icons: [{ type: "tracks" }] },
      { icons: [{ type: "train" }] },
      { icons: [{ type: "train", color: "lightBlue" }] },
      { icons: [{ type: "tree" }] },
      { icons: [{ type: "tunnel" }] },
      { icons: [{ type: "tunnel", color: "gray" }] },
      { icons: [{ type: "water" }] },
      { icons: [{ type: "noenter" }] },
      { icons: [{ type: "noenter", color: "gray" }] },
    ],
  },
  {
    group: "Tokens",
    examples: [
      { tokens: [{ label: "AA", color: "orange" }] },
      { tokens: [{ label: "AA2", bar: true, color: "orange" }] },
      { tokens: [{ label: "AA3", bar: true, barHeight: 30, color: "orange" }] },
      { tokens: [{ label: "BB", color: "orange", square: "blue" }] },
      {
        tokens: [
          { label: "BB2", color: "orange", square: "blue", shapeAngle: 45 },
        ],
      },
      {
        tokens: [
          {
            label: "CC",
            bar: true,
            quarters: ["blue", "orange", "orange", "blue"],
          },
        ],
      },
      {
        tokens: [
          {
            label: "CC2",
            shapeAngle: 120,
            bar: true,
            quarters: ["blue", "orange", "orange", "blue"],
          },
        ],
      },
      { tokens: [{ label: "DD", halves: ["blue", "orange"], bar: true }] },
      {
        tokens: [{ label: "EE", bar: true, color: "blue", stripes: "orange" }],
      },
      {
        tokens: [
          {
            label: "EE2",
            stripesWidth: 10,
            stripesDistance: 6,
            shapeAngle: -15,
            color: "blue",
            stripes: "orange",
          },
        ],
      },
      { tokens: [{ label: "FF", color: "orange", bar: "blue" }] },
      { tokens: [{ label: "GG", bar: true, stripe: "orange", color: "blue" }] },
      {
        tokens: [
          {
            label: "GG2",
            bar: true,
            stripe: "orange",
            color: "blue",
            shapeAngle: 45,
          },
        ],
      },
      { tokens: [{ label: "HH", target: "orange", color: "blue", bar: true }] },
      {
        tokens: [
          {
            label: "II",
            target: "orange",
            halves: ["purple", "blue"],
            bar: true,
          },
        ],
      },
      {
        tokens: [
          { label: "JJ", bar: true, color: "blue", curvedStripes: "orange" },
        ],
      },
      {
        tokens: [
          {
            label: "JJ2",
            curvedStripesWidth: 12,
            curvedStripesDistance: 16,
            shapeAngle: -15,
            color: "blue",
            curvedStripes: "orange",
          },
        ],
      },
      {
        tokens: [
          {
            label: "KK",
            bar: true,
            curvedStripes: "black",
            curvedStripesDistance: 19,
            stripe: "black",
            stripeWidth: "6.25",
            color: "orange",
          },
        ],
      },
      { tokens: [{ label: "LL", spiral: "orange", color: "blue" }] },
      {
        tokens: [
          {
            label: "LL2",
            spiralWidth: 2,
            spiralDistance: 4,
            spiral: "orange",
            color: "blue",
          },
        ],
      },
      { tokens: [{ label: "MM", circle: true, color: "blue" }] },
      {
        tokens: [
          { label: "MM2", circleRadius: 20, circle: "orange", color: "blue" },
        ],
      },
      {
        tokens: [
          {
            label: "NN",
            hexagram: ["lavender", "violet"],
            labelColor: "white",
          },
        ],
      },
      {
        tokens: [{ label: "OO", sexies: ["green", "brightGreen"], bar: true }],
      },
      {
        tokens: [
          {
            label: "PP",
            sunrise: ["lightBlue", "yellow", "orange"],
            bar: true,
          },
        ],
      },
      { tokens: [{ label: "XYZ", shield: true }] },
      { tokens: [{ label: "xyzzy", shield: "yellow", shieldTop: "orange" }] },
      { tokens: [{ label: "USA", shield3: true }] },
      {
        tokens: [
          {
            label: "CFR",
            shield3: "white",
            shield3TopLeft: "red",
            shield3TopCenter: "yellow",
            shield3TopRight: "blue",
          },
        ],
      },
      { tokens: [{ label: "JWO", kiteshield: "yellow" }] },
      { tokens: [{ label: "SY", star5: "red" }] },
      { tokens: [{ label: "KO", color: "purple" }] },
      { tokens: [{ company: "KO" }] },
      { tokens: [{ company: "KU", destination: true }] },
      { tokens: [{ company: "TR", reserved: true }] },
      { tokens: [{ logo: "dev/emacs" }] },
      { tokens: [{ icon: "coal" }] },
      { tokens: [{ icon: "port", iconColor: "red" }] },
      { tokens: [{ icon: "mail" }] },
      { tokens: [{ icon: "mail", iconColor: "orange" }] },
      { tokens: [{ icon: "tracks", label: "$100" }] },
      { tokens: [{ icon: "boat", iconColor: "red", label: "Free" }] },
      { tokens: [{ icon: "noenter" }] },
    ],
  },
  {
    group: "Cities",
    examples: [
      { cities: [{}] },
      { cities: [{ name: { offset: 75, name: "Boston" } }] },
      {
        cities: [
          { companies: ["NYNH"], name: { reverse: true, name: "New York" } },
        ],
      },
      {
        cities: [
          { size: 2, companies: [{}, "B&O"], name: { name: "Baltimore" } },
        ],
      },
      { cities: [{ size: 3, name: { name: "New York" }, companies: ["NYC"] }] },
      {
        cities: [
          {
            size: 4,
            icons: ["mail", null, null, "boat"],
            name: { name: "Boston" },
            companies: [null, "B&M", { abbrev: "PRR", reserved: true }],
          },
        ],
      },
      {
        cities: [
          {
            size: 5,
            icons: [null, "share", null, "charter"],
            companies: ["C&O", null, "B&M", null, "NYC"],
          },
        ],
      },
      {
        cities: [
          {
            size: 6,
            icons: [null, "water", null, "port", null, "train"],
            companies: ["C&O", null, "B&M", null, "NYC"],
          },
        ],
      },
      { cities: [{ size: 1, pass: true }] },
      { cities: [{ size: 2, pass: true }] },
      { cities: [{ size: 3, icons: ["meat", "noenter", "share"] }] },
    ],
  },
  {
    group: "Towns",
    examples: [
      { towns: [{}] },
      { towns: [{ name: { name: "Austin" } }] },
      { towns: [{ name: { name: "Boston", reverse: true } }] },
      { centerTowns: [{}] },
      { centerTowns: [{ size: 2 }] },
      { centerTowns: [{ color: "orange", name: { name: "Austin" } }] },
      { centerTowns: [{ name: { name: "Boston", reverse: true } }] },
      { boomtowns: [{}] },
      { boomtowns: [{ city: true }] },
      { boomtowns: [{ city: false, size: 2 }] },
      { boomtowns: [{ city: true, size: 2 }] },
      { boomtowns: [{ color: "orange", name: { name: "Denver" } }] },
      {
        boomtowns: [
          { color: "water", angle: -90, percent: 0.2 },
          { city: true, angle: 90, percent: 0.34 },
        ],
      },
    ],
  },
  {
    group: "Medium Cities",
    examples: [
      { mediumCities: [{}] },
      { mediumCities: [{ color: "orange", name: { name: "Austin" } }] },
      { mediumCities: [{ name: { name: "Boston", reverse: true } }] },
    ],
  },
  {
    group: "Labels",
    examples: [
      { labels: [{ label: "B" }] },
      { labels: [{ label: "NY" }] },
      { labels: [{ label: "OO" }] },
    ],
  },
  {
    group: "Track",
    examples: [
      { track: [{ side: 1, type: "straight" }] },
      { track: [{ side: 1, type: "straight", end: 0.75 }] },
      { track: [{ side: 3, type: "gentle", gauge: "narrow" }] },
      {
        track: [
          { side: 5, type: "gentle", end: 0.75 },
          { side: 3, type: "gentle", start: 0.25 },
        ],
      },
      {
        track: [
          { side: 3, type: "straight", gauge: "dual", end: 0.3667 },
          { side: 2, type: "gentle", gauge: "dual", end: 0.5 },
          { side: 6, type: "straight", gauge: "dual", end: 0.3667 },
          { side: 5, type: "gentle", gauge: "dual", start: 0.5 },
        ],
        centerTowns: [
          { color: "white", angle: -60, percent: 0.28 },
          { color: "white", angle: 120, percent: 0.28 },
        ],
      },
      {
        track: [
          { side: 1, type: "sharp", gauge: "dual" },
          { side: 3, type: "sharp", end: 0.5 },
          { side: 4, type: "sharp", start: 0.5 },
        ],
      },
      {
        track: [
          { side: 1, type: "straight", cross: "under" },
          { side: 3, type: "gentle", cross: "over" },
        ],
      },
      {
        track: [
          { side: 4, type: "straight", gauge: "line", end: 0.75 },
          { side: 5, type: "straight", gauge: "dashed" },
        ],
      },
      {
        track: [
          { side: 2, type: "straight", end: 0.125 },
          { side: 3, type: "straight", end: 0.25 },
          { side: 4.5, type: "straight", start: 0.25, end: 0.5 },
        ],
      },
      { track: [{ side: 1, type: "bent" }] },
      {
        track: [
          {
            path: "m 0 85 L 0 50 C 75 0, -75 0, 0 -50 L 0 -85",
            type: "custom",
          },
        ],
      },
      {
        track: [
          { side: 1, type: "offboard" },
          { side: 6, type: "offboard" },
        ],
      },
      {
        track: [
          { side: 1, type: "gentle", cross: "under", color: "water" },
          { side: 2, type: "gentle", cross: "over", color: "mountain" },
        ],
      },
      {
        track: [
          {
            side: 3,
            type: "gentle",
            gauge: "narrow",
            color: "mountain",
            borderColor: "black",
            gaugeColor: "yellow",
          },
          {
            side: 4,
            type: "gentle",
            gauge: "dual",
            color: "water",
            borderColor: "black",
            gaugeColor: "green",
          },
        ],
      },
      {
        track: [
          { type: "sharpInner", side: 1 },
          { type: "sharpOuter", side: 1 },
        ],
      },
      {
        comment:
          "The base offset is 17.15 from center, so these are 1.5 and 0.5 times that",
        track: [
          { type: "sharp", side: 1, trackOffset: -25.72 },
          { type: "sharp", side: 1, trackOffset: -8.57 },
          { type: "sharp", side: 1, trackOffset: 25.72 },
          { type: "sharp", side: 1, trackOffset: 8.57 },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1 },
          { type: "gentleOuter", side: 1 },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1 },
          { type: "gentleOuter", side: 1 },
          { type: "gentle", side: 1 },
        ],
      },
      {
        track: [
          { type: "gentle", side: 1, trackOffset: -25.72 },
          { type: "gentle", side: 1, trackOffset: -8.57 },
          { type: "gentle", side: 1, trackOffset: 25.72 },
          { type: "gentle", side: 1, trackOffset: 8.57 },
        ],
      },
      {
        track: [
          { type: "straightLeft", side: 1 },
          { type: "straightRight", side: 1 },
        ],
      },
      {
        track: [
          { type: "straight", side: 1, trackOffset: -25.72 },
          { type: "straight", side: 1, trackOffset: -8.57 },
          { type: "straight", side: 1, trackOffset: 25.72 },
          { type: "straight", side: 1, trackOffset: 8.57 },
        ],
      },
      {
        track: [
          { type: "sharpInner", side: 1, end: 0.333 },
          { type: "sharp", side: 1, begin: 0.333, end: 0.666 },
          { type: "sharpOuter", side: 1, begin: 0.666 },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1, end: 0.333 },
          { type: "gentle", side: 1, begin: 0.333, end: 0.666 },
          { type: "gentleOuter", side: 1, begin: 0.666 },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1 },
          { type: "gentleOuter", side: 1, cross: "over" },
          { type: "gentleInner", side: 4 },
          { type: "gentleOuter", side: 4, cross: "under" },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1, radiusOffset: 50 },
          { type: "gentle", side: 1, radiusOffset: 50 },
          { type: "gentleOuter", side: 1, radiusOffset: 50 },
          { type: "gentleInner", side: 4, radiusOffset: 50 },
          { type: "gentle", side: 4, radiusOffset: 50 },
          { type: "gentleOuter", side: 4, radiusOffset: 50 },
        ],
      },
      {
        track: [
          { type: "gentle", side: 1, trackOffset: -25.72, radiusOffset: 320 },
          { type: "gentle", side: 1, trackOffset: -8.57, radiusOffset: 320 },
          { type: "gentle", side: 1, trackOffset: 25.72, radiusOffset: 320 },
          { type: "gentle", side: 1, trackOffset: 8.57, radiusOffset: 320 },
          { type: "gentle", side: 4, trackOffset: -25.72, radiusOffset: 320 },
          { type: "gentle", side: 4, trackOffset: -8.57, radiusOffset: 320 },
          { type: "gentle", side: 4, trackOffset: 25.72, radiusOffset: 320 },
          { type: "gentle", side: 4, trackOffset: 8.57, radiusOffset: 320 },
        ],
      },
      {
        track: [
          { type: "gentleInner", side: 1 },
          { type: "gentleInner", side: 4 },
          { type: "sharpOuter", side: 3 },
          { type: "sharp", side: 3 },
          { type: "sharpInner", side: 3 },
          { type: "sharpOuter", side: 6 },
          { type: "sharp", side: 6 },
          { type: "sharpInner", side: 6 },
        ],
      },
      {
        track: [
          {
            side: 1,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 1,
            type: "straight",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 2,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 2,
            type: "straight",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 3,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 3,
            type: "straight",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 4,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 5,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 6,
            type: "gentle",
            gauge: "dashed",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
        ],
      },
      {
        track: [
          {
            side: 1,
            type: "gentle",
            gauge: "narrow",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 5,
            type: "gentle",
            gauge: "narrow",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
          {
            side: 1,
            type: "straight",
            gauge: "narrow",
            color: "match",
            borderColor: "match",
            gaugeColor: "black",
          },
        ],
      },
    ],
  },
  {
    group: "Offboard Revenues",
    examples: [
      {
        offBoardRevenue: {
          name: { name: "Boston" },
          revenues: [
            {
              color: "yellow",
              cost: 20,
            },
            {
              color: "brown",
              cost: 40,
            },
          ],
        },
      },
      {
        color: "offboard",
        offBoardRevenue: {
          reverse: true,
          name: { name: "Boston" },
          revenues: [
            {
              color: "yellow",
              cost: 20,
              phase: 2,
            },
            {
              color: "brown",
              cost: 40,
              phase: 5,
              phaseColor: "brown",
            },
          ],
        },
      },
      {
        offBoardRevenue: {
          name: { name: "Boston" },
          reverse: true,
          rows: 2,
          revenues: [
            {
              color: "yellow",
              cost: 20,
            },
            {
              color: "green",
              cost: 30,
            },
            {
              color: "brown",
              cost: 40,
            },
            {
              color: "gray",
              cost: 120,
            },
          ],
        },
      },
    ],
  },
  {
    group: "Borders",
    examples: [
      { borders: [{ side: 1, color: "offboard" }] },
      {
        borders: [
          { side: 1, color: "water" },
          { side: 2, color: "water" },
        ],
      },
      {
        borders: [
          { side: 4, color: "mountain", dashed: true },
          { side: 5, color: "mountain", dashed: true },
          { side: 6, color: "mountain", dashed: true },
        ],
      },
    ],
  },
  {
    group: "Terrain",
    examples: [
      { terrain: [{}] },
      { terrain: [{ size: "medium", cost: 60 }] },
      { terrain: [{ type: "mountain", cost: 100 }] },
      { terrain: [{ type: "water", cost: 40 }] },
      { terrain: [{ type: "river", cost: 20 }] },
      { terrain: [{ type: "cactus", cost: 20 }] },
      { terrain: [{ type: "cow-skull", cost: 10 }] },
      { terrain: [{ type: "tree", cost: 20, color: "green" }] },
      { terrain: [{ size: "tiny", type: "river", cost: 10 }] },
      { terrain: [{ size: "large", type: "swamp", cost: 120 }] },
      { terrain: [{ size: "medium", type: "noenter", cost: 120 }] },
    ],
  },
  {
    group: "Tunnels and Bridges",
    examples: [
      { tunnels: [{ cost: 40 }] },
      { bridges: [{ cost: 40 }] },
      { tunnelEntrances: [{ percent: 1 }] },
      {
        tunnelEntrances: [
          { angle: 120, percent: 1, rotation: -60, color: "red" },
          { angle: 180, percent: 1, color: "orange" },
          { angle: 240, percent: 1, rotation: 60, color: "yellow" },
        ],
      },
    ],
  },
  {
    group: "Shapes",
    examples: [
      { shapes: [{ type: "diamond", text: "+20", color: "orange" }] },
      { shapes: [{ type: "triangle", text: "-20", color: "mountain" }] },
      {
        shapes: [
          { type: "triangle", text: "20", color: "water", reverse: true },
        ],
      },
      { shapes: [{ type: "hexagon", text: "80", color: "mountain" }] },
      {
        shapes: [
          {
            type: "hexagon",
            text: "threeve",
            width: 100,
            color: "yellow",
            borderWidth: 0,
          },
        ],
      },
      { shapes: [{ color: "red", text: "CG", textColor: "white" }] },
      {
        shapes: [
          { color: "white", width: 64, borderWidth: 0 },
          { width: 60, dashed: true },
          { color: "black", width: 40 },
        ],
      },
      {
        shapes: [
          { width: 100, color: "yellow" },
          {
            type: "triangle",
            color: "mountain",
            opacity: 0.9,
            angle: 60,
            percent: 0.6,
          },
          {
            type: "triangle",
            color: "water",
            reverse: true,
            angle: -60,
            percent: 0.6,
          },
          {
            type: "diamond",
            color: "black",
            opacity: "0.5",
            angle: 180,
            percent: 0.6,
          },
        ],
      },
      {
        color: "white",
        cities: [{ size: 6, width: 22, color: "blue" }],
        track: [
          { side: 1, color: "red", type: "straight" },
          { side: 2, color: "red", type: "straight" },
          { side: 3, color: "red", type: "straight" },
        ],
        values: [{ value: 1776 }],
        shapes: [
          {
            type: "star",
            color: "white",
            angle: 180,
            percent: 0.6,
            width: 12,
          },
          {
            type: "star",
            color: "white",
            angle: 120,
            percent: 0.6,
            width: 12,
          },
          {
            type: "star",
            color: "white",
            angle: -120,
            percent: 0.6,
            width: 12,
          },
          {
            type: "star",
            color: "white",
            angle: -60,
            percent: 0.6,
            width: 12,
          },
          {
            type: "star",
            color: "white",
            angle: 60,
            percent: 0.6,
            width: 12,
          },
          {
            type: "star",
            color: "white",
            angle: 0,
            percent: 0.6,
            width: 12,
          },
        ],
      },
    ],
  },
  {
    group: "Route Bonuses",
    examples: [
      { routeBonus: [{ value: "$40" }] },
      {
        routeBonus: [
          {
            value: "+$120",
            fillColor: "black",
            strokeColor: "red",
            textColor: "white",
          },
        ],
      },
    ],
  },
];

const useStyles = makeStyles((theme) => ({
  hex: {
    display: "flex",
    justifyContent: "center",
  },

  atom: {
    padding: theme.spacing(2, 2, 0, 2),

    "& pre": {
      overflow: "auto",
      maxHeight: 300,
      padding: theme.spacing(1),
      backgroundColor: theme.palette.grey[300],
      borderRadius: theme.shape.borderRadius,
    },
  },

  page: {
    overflow: "auto",
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },
  },
}));

const groupItems = map(
  (atom) => (
    <MenuItem key={atom.group} value={atom.group}>
      {atom.group}
    </MenuItem>
  ),
  atoms,
);

const Atoms = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [group, setGroup] = useStringParam("group", atoms[0].group);

  const examples = useMemo(
    () =>
      addIndex(chain)((h, id) => {
        return (
          <Grid
            key={`example-${id}`}
            className={classes.atom}
            size={{ xs: 12, sm: 6, lg: 4 }}
          >
            <Box className={classes.hex}>
              <Svg
                width="175.205"
                height="152"
                viewBox="-87.6025 -76 175.205 152"
              >
                <Hex hex={h} id={`${id}`} border={true} bleed={true} />
              </Svg>
            </Box>
            <SyntaxHighlighter
              style={style}
              customStyle={{ margin: "1em 0" }}
              language="json"
            >
              {JSON.stringify(h, null, 2)}
            </SyntaxHighlighter>
          </Grid>
        );
      }),
    [classes],
  );

  const hexes = useMemo(
    () => find(propEq(group, "group"), atoms).examples,
    [group],
  );

  return (
    <Container maxWidth="lg">
      <Paper data-testid="atoms" elevation={5} className={classes.page}>
        <Typography variant="h4" gutterBottom>
          {t("elements.atoms.title")}
        </Typography>
        <Typography variant="body1">
          {t("elements.atoms.page.description")}
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
        {examples(hexes)}
      </Grid>
    </Container>
  );
};

export default Atoms;
