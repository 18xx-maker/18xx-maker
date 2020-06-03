import React from "react";
import { Route, Switch } from "react-router-dom";

import Atoms from "./elements/Atoms";
import Logos from "./elements/Logos";
import Tiles from "./elements/Tiles";

const Elements = () => {
  return (
    <Switch>
      <Route path="/elements/tiles" exact>
        <Tiles/>
      </Route>
      <Route path="/elements/logos" exact>
        <Logos/>
      </Route>
      <Route>
        <Atoms/>
      </Route>
    </Switch>
  );
};

export default Elements;
