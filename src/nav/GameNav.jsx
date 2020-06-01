import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Switch as RouterSwitch, Route } from 'react-router';
import { Link as RouterLink } from "react-router-dom";

import GameContext from "../context/GameContext";
import { useBooleanParam, useIntParam } from "../util/query";

import addIndex from "ramda/src/addIndex";
import isNil from "ramda/src/isNil";
import map from "ramda/src/map";

import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";

import CloseIcon from "@material-ui/icons/Close";
import GameIcon from "@material-ui/icons/Train";
import WarningIcon from "@material-ui/icons/Warning";

import File from "../util/File";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  input: {
    width: 200
  },
  warning: {
    color: theme.palette.warning.main
  }
}));

const GameNav = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { game, closeGame } = useContext(GameContext);

  const [hidePrivates, togglePrivates] = useBooleanParam('hidePrivates');
  const [hideShares, toggleShares] = useBooleanParam('hideShares');
  const [hideTrains, toggleTrains] = useBooleanParam('hideTrains');
  const [hideNumbers, toggleNumbers] = useBooleanParam('hideNumbers');

  const [paginated, togglePagination] = useBooleanParam('paginated');
  const [variation, setVariation] = useIntParam('variation');
  const handleVariation = (event) => setVariation(event.target.value);
  const hasVariation = !isNil(variation);

  if (!game) {
    return null;
  }

  return (
    <>
      <List>
        <ListItem button
                  component={RouterLink}
                  to={`/games/${game.slug}/`}>
          <ListItemIcon><GameIcon/></ListItemIcon>
          <ListItemText primary={game.info.title}
                        secondary={`${t('game.by')} ${game.info.designer}`}/>
        </ListItem>
        <ListItem button onClick={closeGame}>
          <ListItemIcon><CloseIcon color="secondary"/></ListItemIcon>
          <ListItemText>{t('game.unload')}</ListItemText>
        </ListItem>
        <File data={game}
              filename={`${game.id}.json`}
              list/>
        <ListItem>
          <ListItemIcon>
            <WarningIcon className={classes.warning}/>
          </ListItemIcon>
          <ListItemText primary={t('wip.wip')} secondary={t('wip.description')}/>
        </ListItem>
      </List>
      <Divider/>
      <RouterSwitch>
        <Route path="/games/:slug" exact/>
        <Route>
          <List>
            <RouterSwitch>
              <Route path="/games/:slug/map">
                <ListItem>
                  <FormControlLabel control={ <Switch checked={paginated}
                                 onChange={togglePagination}
                                 color="primary"
                                 name="pagination"/> }
                                    label={t('game.map.paginated')}/>
                </ListItem>
                {hasVariation && (
                  <ListItem>
                    <FormControl className={classes.input} variant="filled">
                      <InputLabel id="variation-label">{t('game.map.variation')}</InputLabel>
                      <Select labelId="variation-label"
                              id="variation"
                              name="variation"
                              value={variation}
                              onChange={handleVariation}>
                        {addIndex(map)((m,i) => <MenuItem key={`variation-${i}`} value={i}>{m.name}</MenuItem>, game.map)}
                      </Select>
                    </FormControl>
                  </ListItem>
                )}
              </Route>
              <Route path="/games/:slug/cards">
                <ListItem>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">{t('show')}</FormLabel>
                    <FormGroup>
                      <FormControlLabel control={ <Checkbox checked={!hidePrivates}
                    onChange={togglePrivates}
                    color="primary"
                    name="showPrivates"/> }
                                        label={t('game.cards.privates')}/>
                      <FormControlLabel control={ <Checkbox checked={!hideShares}
                                                                          onChange={toggleShares}
                                                                          color="primary"
                                                                          name="showShares"/> }
                                        label={t('game.cards.shares')}/>
                      <FormControlLabel control={ <Checkbox checked={!hideTrains}
                      onChange={toggleTrains}
                      color="primary"
                      name="showTrains"/> }
                                        label={t('game.cards.trains')}/>
                      <FormControlLabel control={ <Checkbox checked={!hideNumbers}
                                                        onChange={toggleNumbers}
                                                        color="primary"
                                                        name="showNumbers"/> }
                                        label={t('game.cards.numbers')}/>
                    </FormGroup>
                  </FormControl>
                </ListItem>
              </Route>
            </RouterSwitch>
          </List>
          <Divider/>
        </Route>
      </RouterSwitch>
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
