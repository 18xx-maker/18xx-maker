import React from "react";

const Name = ({ name, reverse, rotation, town }) => {
  let path = town ? "townPath" : "cityPath";
  if(reverse) {
    path = path + "Reverse";
  }
  return (
    <text
      dy={reverse ? (town ? 8 : 7) : 0}
      transform={`rotate(${(rotation || 0) + 360})`}
      fontFamily="Helvetica, Arial, sans-serif"
      font-size="10"
      font-weight="bold"
      textAnchor="middle"
      >
      <textPath startOffset="50%" href={`#${path}`}>{name}</textPath>
    </text>
  );
};

export default Name;
