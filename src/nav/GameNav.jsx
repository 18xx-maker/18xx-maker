import React, { useContext } from "react";

import { Link as RouterLink } from "react-router-dom";

import GameContext from "../context/GameContext";

import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import CloseIcon from "@material-ui/icons/Close";
import GameIcon from "@material-ui/icons/Train";

import File from "../util/File";

const GameNav = () => {
  const { game, closeGame } = useContext(GameContext);

  if (!game) {
    return null;
  }

  return (
    <>
      <List>
        <ListItem>
          <ListItemIcon>
            <GameIcon/>
          </ListItemIcon>
          <ListItemText primary={game.info.title}
                        secondary={game.info.designer}/>
        </ListItem>
        <ListItem button onClick={closeGame}>
          <ListItemIcon>
            <CloseIcon/>
          </ListItemIcon>
          <ListItemText>Unload Game</ListItemText>
        </ListItem>
        <File data={game}
              filename={`${game.id}.json`}
              list/>
      </List>
      <Divider/>
      <List>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/background`}>
          <ListItemText>Background</ListItemText>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/cards`}>
          <ListItemText>Cards</ListItemText>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/charters`}>
          <ListItemText>Charters</ListItemText>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/map`}>
          <ListItemText>Map</ListItemText>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/market`}>
          <ListItemText primary="Market"/>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/par`}>
          <ListItemText primary="Par"/>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/revenue`}>
          <ListItemText primary="Revenue"/>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/manifest`}>
          <ListItemText primary="Tile Manifest"/>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/tiles`}>
          <ListItemText primary="Tiles"/>
        </ListItem>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/tokens`}>
          <ListItemText primary="Tokens"/>
        </ListItem>
      </List>
    </>
  )
};

export default GameNav;
