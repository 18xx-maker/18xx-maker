import React from "react";
import { Link } from "react-router-dom";

const GameNav = ({ game, ipo }) => {
  return (
    <React.Fragment>
      <h2>{game}</h2>
      <ul>
        <li>
          <Link to={`/${game}/background`}>Background</Link>
        </li>
        <li>
          <Link to={`/${game}/charters`}>Charters</Link>
        </li>
        {ipo && (
          <li>
            <Link to={`/${game}/ipo`}>IPO</Link>
          </li>
        )}
        <li>
          <Link to={`/${game}/map`}>Map</Link>&nbsp;/&nbsp;
          <Link to={`/${game}/map-paginated`}>Paginated</Link>
        </li>
        <li>
          <Link to={`/${game}/privates`}>Privates</Link>
        </li>
        <li>
          <Link to={`/${game}/revenue`}>Revenue</Link>
        </li>
        <li>
          <Link to={`/${game}/shares`}>Shares</Link>
        </li>
        <li>
          <Link to={`/${game}/stock`}>Stock Market</Link>
        </li>
        <li>
          <Link to={`/${game}/tiles`}>Tiles</Link>&nbsp;/&nbsp;
          <Link to={`/${game}/manifest`}>Manifest</Link>
        </li>
        <li>
          <Link to={`/${game}/tokens`}>Tokens</Link>
        </li>
        <li>
          <Link to={`/${game}/trains`}>Trains</Link>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default GameNav;
