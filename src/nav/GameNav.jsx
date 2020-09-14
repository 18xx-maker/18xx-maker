import React from "react";
import { useTranslation } from 'react-i18next';
import { Switch as RouterSwitch, Route, matchPath } from 'react-router';
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useGame } from "../context/GameContext";
import { useBooleanParam, useIntParam } from "../util/query";

import addIndex from "ramda/src/addIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";

import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";

import BGGIcon from "@material-ui/icons/Storage";
import GameIcon from "@material-ui/icons/Train";
import LicenseIcon from "@material-ui/icons/Lock";
import PurchaseIcon from "@material-ui/icons/MonetizationOn";
import RulesIcon from "@material-ui/icons/Gavel";
import WarningIcon from "@material-ui/icons/Warning";

import File from "../util/File";

import { makeStyles } from '@material-ui/core/styles';
import { green, blue } from '@material-ui/core/colors';

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
  const { game } = useGame();
  const location = useLocation();

  const [hidePrivates, togglePrivates] = useBooleanParam('hidePrivates');
  const [hideShares, toggleShares] = useBooleanParam('hideShares');
  const [hideTrains, toggleTrains] = useBooleanParam('hideTrains');
  const [hideNumbers, toggleNumbers] = useBooleanParam('hideNumbers');

  const [paginated, togglePagination] = useBooleanParam('paginated');
  const [variation, setVariation] = useIntParam('variation', 0);
  const handleVariation = (event) => setVariation(event.target.value);

  if (!game) {
    return null;
  }

  const hasVariation = is(Array, game.map);

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
        {game.links && game.links.license && (
          <ListItem button
                    component={Link}
                    color="inherit"
                    underline="none"
                    target="_blank"
                    href={game.links.license}>
            <ListItemIcon><LicenseIcon color="error" /></ListItemIcon>
            <ListItemText primary={t('game.license.primary')} secondary={t('game.license.secondary')} />
          </ListItem>
        )}
        {game.links && game.links.purchase && (
          <ListItem button
                    component={Link}
                    color="inherit"
                    underline="none"
                    target="_blank"
                    href={game.links.purchase}>
            <ListItemIcon><PurchaseIcon style={{color: green[500]}}/></ListItemIcon>
            <ListItemText primary={t('game.purchase.primary')} secondary={t('game.purchase.secondary')} />
          </ListItem>
        )}
        {game.links && game.links.bgg && (
          <ListItem button
                    component={Link}
                    color="inherit"
                    underline="none"
                    target="_blank"
                    href={game.links.bgg}>
            <ListItemIcon><BGGIcon/></ListItemIcon>
            <ListItemText>{t('game.bgg')}</ListItemText>
          </ListItem>
        )}
        {game.links && game.links.rules && (
          <ListItem button
                    component={Link}
                    color="inherit"
                    underline="none"
                    target="_blank"
                    href={game.links.rules}>
            <ListItemIcon><RulesIcon/></ListItemIcon>
            <ListItemText primary={t('game.rules')} />
          </ListItem>
        )}
        <File data={game}
              filename={`${game.id}.json`}
              list/>
        {game.prototype && (
          <ListItem>
            <ListItemIcon><WarningIcon style={{color: blue[500]}}/></ListItemIcon>
            <ListItemText primary={t('prototype.prototype')} secondary={t('prototype.description')}/>
          </ListItem>
        )}
        {game.wip && (
          <ListItem>
            <ListItemIcon><WarningIcon className={classes.warning}/></ListItemIcon>
            <ListItemText primary={t('wip.wip')} secondary={t('wip.description')}/>
          </ListItem>
        )}
      </List>
      <Divider/>
      <RouterSwitch>
        <Route path="/games/:slug" exact/>
        <Route>
          <List>
            <RouterSwitch>
              <Route path="/games/:slug/revenue">
                <ListItem>
                  <FormControlLabel control={ <Switch checked={paginated}
                                 onChange={togglePagination}
                                 color="primary"
                                 name="pagination"/> }
                                    label={t('game.paginated')}/>
                </ListItem>
              </Route>
              <Route path="/games/:slug/par">
                <ListItem>
                  <FormControlLabel control={ <Switch checked={paginated}
                                 onChange={togglePagination}
                                 color="primary"
                                 name="pagination"/> }
                                    label={t('game.paginated')}/>
                </ListItem>
              </Route>
              <Route path="/games/:slug/market">
                <ListItem>
                  <FormControlLabel control={ <Switch checked={paginated}
                                 onChange={togglePagination}
                                 color="primary"
                                 name="pagination"/> }
                                    label={t('game.paginated')}/>
                </ListItem>
              </Route>
              <Route path="/games/:slug/map">
                <ListItem>
                  <FormControlLabel control={ <Switch checked={paginated}
                                 onChange={togglePagination}
                                 color="primary"
                                 name="pagination"/> }
                                    label={t('game.paginated')}/>
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
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/background'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/background`}>
          <ListItemText>Background</ListItemText>
        </ListItem>
        <ListItem button
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/cards'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/cards`}>
          <ListItemText>Cards</ListItemText>
        </ListItem>
        <ListItem button
                  disabled={!game.companies}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/charters'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/charters`}>
          <ListItemText>Charters</ListItemText>
        </ListItem>
        <ListItem button
                  disabled={!game.map}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/map'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/map`}>
          <ListItemText>Map</ListItemText>
        </ListItem>
        <ListItem button
                  disabled={!game.stock || !game.stock.market}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/market'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/market`}>
          <ListItemText primary="Market"/>
        </ListItem>
        <ListItem button
                  disabled={!game.stock || !game.stock.par || !game.stock.par.values}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/par'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/par`}>
          <ListItemText primary="Par"/>
        </ListItem>
        <ListItem button
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/revenue'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/revenue`}>
          <ListItemText primary="Revenue"/>
        </ListItem>
        <ListItem button
                  disabled={!game.tiles}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/tile-manifest'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/tile-manifest`}>
          <ListItemText primary="Tile Manifest"/>
        </ListItem>
        <ListItem button
                  disabled={!game.tiles}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/tiles'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/tiles`}>
          <ListItemText primary="Tiles"/>
        </ListItem>
        <ListItem button
                  disabled={!game.companies}
                  selected={!!matchPath(location.pathname, {path: '/games/:slug/tokens'})}
                  component={RouterLink}
                  to={`/games/${game.slug}/tokens`}>
          <ListItemText primary="Tokens"/>
        </ListItem>
      </List>
    </>
  )
};

export default GameNav;
