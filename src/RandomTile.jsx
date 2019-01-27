import React from "react";
import {withRouter} from "react-router";

import Svg from "./Svg";
import Tile from "./Tile";
import tiles from "./data/tiles";

import keys from "ramda/es/keys";

const randomTile = () => keys(tiles)[Math.floor(Math.random() * keys(tiles).length)];

class RandomTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tile: randomTile()
    };
  }

  componentDidMount() {
    this.props.history.listen(() => this.setState({tile: randomTile()}));
  }

  render() {
    return (
      <Svg viewBox={`-86.6025 -75 173.205 150`}>
        <Tile id={this.state.tile} />
      </Svg>
    );
  }
};

export default withRouter(RandomTile);
