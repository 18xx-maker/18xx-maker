import React from "react";

const Name = ({ name, reverse, rotation, town, size, offset, y, textLength }) => {
  let path = town ? "townPath" : `city${size > 1 ? size : ""}Path`;
  if (reverse) {
    path = path + "Reverse";
  }
  return (
    <text
      dy={y || (reverse ? (town ? 8 : 7) : 0)}
      transform={`rotate(${(rotation || 0) + 360})`}
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize="10"
      fontWeight="bold"
      textLength={textLength}
      textAnchor="middle"
    >
      <textPath transform="scale(1.8)" startOffset={`${offset || 50}%`} href={`#${path}`}>
        {name}
      </textPath>
    </text>
  );
};

export default Name;
