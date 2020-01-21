import React from "react";

const Page = ({title, component, current, total}) => (
  <div className="cutlines__page">{title} - {component} - page {current} of {total}</div>
);

export default Page;
