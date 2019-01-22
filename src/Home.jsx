import React from "react";
import Games from "./Games";
import {connect} from "react-redux";
import {setScheme} from "./store/actions";

import TileNav from "./TileNav";

const Home = ({ scheme, setScheme }) => {
  return (
    <div className="home">
      <div className="tiles">
        <TileNav />
      </div>
      <Games />
    </div>
  );
};

const mapStateToProps = state => ({
  scheme: state.config.scheme
});

const mapDispatchToProps = dispatch => ({
  setScheme: scheme => dispatch(setScheme(scheme))
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
