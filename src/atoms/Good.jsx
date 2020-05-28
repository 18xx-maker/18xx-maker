import React from "react";

import Square from "./shapes/Square";

const Good = (props) => (
  <Square color="white"
          borderColor="track"
          width={40}
          {...props}/>
);

export default Good;
