import React from "react";
import { colors } from "../data";

const edge = 150 * 0.57735;

const Border = ({ color, border }) => {
  if (border) {
    return (
      <path
        d={`m -75 ${0.5 * edge} L -75 ${-0.5 * edge}`}
        fill="none"
        stroke={colors["border"]}
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        clip-path="url(#hexClip)"
      />
    );
  } else {
    return (
      <path
        d={`m -75 ${0.5 * edge} L -75 ${-0.5 * edge}`}
        fill="none"
        stroke={colors[color]}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        clip-path="url(#hexClip)"
      />
    );
  }
};

export default Border;
