import React from "react";
import { colors } from "../data";

const Town = ({ border }) => {
  if (border) {
    return (
      <rect width="24" height="14" x="-12" y="-7" fill={colors["border"]} />
    );
  } else {
    return (
      <rect width="20" height="10" x="-10" y="-5" fill={colors["track"]} />
    );
  }
};

export default Town;
