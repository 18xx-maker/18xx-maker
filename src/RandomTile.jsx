import React from "react";
import {withRouter} from "react-router";

import Svg from "./Svg";
import Tile from "./Tile";
import tiles from "./data/tiles";

import keys from "ramda/src/keys";

const randomTile = () => keys(tiles)[Math.floor(Math.random() * keys(tiles).length)];

class RandomTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tile: randomTile()
    };
  }

  componentDidMount() {
    let unlisten = this.props.history.listen(() => this.setState({...this.state, tile: randomTile()}));
    this.setState({...this.state, unlisten});
  }

  componentWillUnmount() {
    if(this.state.unlisten) {
      this.state.unlisten();
    }
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
