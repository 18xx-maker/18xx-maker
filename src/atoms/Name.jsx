import React from "react";

const Name = ({ name, reverse, rotation }) => {
  return (
    <text
      dy={reverse ? 7 : 0}
      transform={`rotate(${(rotation || 0) + 360})`}
      fontFamily="Helvetica, Arial, sans-serif"
      font-size="10"
      font-weight="bold"
      textAnchor="middle"
      >
      <textPath startOffset="50%" href={`#${reverse ? "revCityPath" : "cityPath"}`}>{name}</textPath>
    </text>
  );
};

export default Name;
