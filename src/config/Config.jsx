import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import { diff } from "deep-object-diff";

import ThemePreview from "./ThemePreview";
import Input from "./Input";
import File from "../util/File";

import defaultConfig from "../defaults.json";
import schema from "@18xx-maker/schemas/schemas/config.schema.json";

import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import complement from "ramda/src/complement";
import filter from "ramda/src/filter";
import isEmpty from "ramda/src/isEmpty";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import path from "ramda/src/path";
import split from "ramda/src/split";

import mapThemes from "../data/themes/maps";
import companyThemes from "../data/themes/companies";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from '@material-ui/core/styles';

export const getPath = split('.');
export const getSchemaPath = compose(chain(n => ['properties', n]),
                                     filter(complement(isEmpty)),
                                     split('.'));
export const getSchema = name => path(getSchemaPath(name), schema);

const useStyles = makeStyles((theme) => ({
  configSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    overflow: 'visible'
  },
  configItem: {
    minWidth: 200,
    margin: theme.spacing(3,0,0,0)
  }
}));

const Config = () => {
  const classes = useStyles();
  const { config, setConfig, resetConfig } = useContext(ConfigContext);

  let setOption = event => setConfig({ ...config, [event.target.name]: event.target.value });

  return (
    <Box>
      <Box className={classes.configSection}>
        <Typography variant="h5">Colors and Companies</Typography>
        <FormControl variant="filled" className={classes.configItem}>
          <InputLabel id="theme-label">Theme</InputLabel>
          <Select id="theme"
                  name="theme"
                  labelId="theme-label"
                  value={config.theme}
                  onChange={setOption}>
            {map(theme => <MenuItem key={theme} value={theme}>{mapThemes[theme].name}</MenuItem>, keys(mapThemes))}
          </Select>
        </FormControl>
        <ThemePreview/>
        <Typography variant="caption"
                    display="block"
                    gutterBottom>
          The theme determines which colors are used for all of the elements on the maps and tiles.
        </Typography>

        <FormControl variant="filled"
                     className={classes.configItem}>
          <InputLabel id="companies-theme-label">Companies Theme</InputLabel>
          <Select id="companies-theme"
                  name="companiesTheme"
                  labelId="companies-theme-label"
                  value={config.companiesTheme}
                  onChange={setOption}>
            {map(theme => <MenuItem key={theme} value={theme}>{companyThemes[theme].name}</MenuItem>, keys(companyThemes))}
          </Select>
        </FormControl>
        <ThemePreview companies/>
        <Typography variant="caption" display="block" gutterBottom>
          The company theme determines which colors are used for all of the elements on the maps and tiles.
        </Typography>

        <Input name="companySvgLogos" label="Company Logos"
               description="This lets you choose to use SVG logos (when available) for companies instead of only colors and text. The different settings are explained on the [logos doc](/docs/logos) page" />
        <Input name="overrideCompanies" label="Override Companies"
               description="This lets you change the companies for a game to a set list that are defined in [the code](https://github.com/18xx-maker/18xx-maker/tree/master/src/data/companies)" />
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Layout</Typography>
        <Input name="margin" label="Margin Size" dimension={true}
               description="How much of a margin exists around the printed item."/>
        <Input name="cutlines" label="Pagination Cutlines Size" dimension={true}
               description="Set to 0 to disable any cutlines."/>
        <Input name="cutlinesOffset" label="Pagination Cutlines Offset" dimension={true}
               description="If your method of cutting has a guide that is slightly off from where it cuts, you can adjust an offset here. Leave at 0 otherwise."/>
        <Input name="bleed" label="Pagination Bleed Size" dimension={true}
               description="Set to 0 to disable any bleed. For paginated items this detemines how much map pages overlap to help with cutting errors."/>
        <Input name="paper.width" label="Paper Width" dimension={true}/>
        <Input name="paper.height" label="Paper Height" dimension={true}/>
        <Input name="paper.margins" label="Paper Margins" dimension={true}/>
        <Typography variant="caption" display="block" gutterBottom>
          For reference US Letter size would be 8.5in by 11in. A4 is 210mm by 297mm.
        </Typography>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Tokens</Typography>
        <Input name="tokens.layout" label="Token Layout"
               description="This lets you choose between different layouts when printing tokens. GSP matches the GarageSalePup AWE label sheets and overrides the values below."/>
        <Input name="tokens.marketTokenSize" label="Market Token Size" dimension={true}
               description="Size of the market tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."/>
        <Input name="tokens.stationTokenSize" label="Station Token Size" dimension={true}
               description="Size of the station tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."/>
        <Input name="tokens.generalTokenSize" label="General Token Size" dimension={true}
               description="Size of the tokens specified for the game. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."/>
        <Input name="tokens.reverseMarketTokens" label="Reverse Market Tokens"
               description="Whether to print token stickers for the reverse side of company market tokens. All will print a reverse token for all market tokens (normally 3 or 2 depending on the games settings)."/>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Maps</Typography>
        <Input name="coords" label="Coordinate Type"
               description="This lets you choose where the coordinates appear on the map (if at all)."/>
        <Input name="straightCityNames" label="Straight City Names"
               description="Draw city names straight instead of curved along the city. None of the games included with this tool are meant to be drawn this way so layout issues might be present." />
        <Input name="plainMapCompanies" label="Plain Map Company Spaces"
               description="This sets all home/destination/token spots on maps to be empty white cities with black company text instead of colored or using logos." />
        <Input name="maps.roundTracker" label="Display Map Round Tracker"
               description="Whether or not to show the round tracker on maps. Requires the game file to specify the location." />
        <Input name="maps.players" label="Display Map Players Table"
               description="Whether or not to show the player information table on maps. This includes bank and certificate limit information. Requires the game file to specify the location." />
        {/* This option isn't working yet, will add later */}
        {/* <Checkbox name="plainMapDestinations" label="Plain Map Destination Spaces" */}
        {/*           description="This sets all destination spots on maps to be empty white cities with black company text:" /> */}
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Tiles</Typography>
        <Input name="tiles.id" label="Tile ID Location"
               description="This determines where to render the tile id"/>
        <Input name="tiles.layout" label="Tile Sheet Layout"
               description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and die is meant from the custom die cutters that Deep Thought Games uses. Setting either die option overrides page size and the tile size option below."/>
        <Input name="tiles.width" label="Tile Width" dimension={true}
               description="This determines the default size of tiles. It defines the distance from flat to flat. 1.5in would be standard 18xx size. 1.0625in is small (1822 / 18OE) size. GMT uses 1.75in."/>
        <Input name="tiles.mapWidth" label="Map Tile Width" dimension={true}
               description="This determines the default size of map hexes. This is if you want your maps drawn bigger than your tiles. Depending on how you cut your tiles this can help a lot."/>
        <Input name="tiles.gaps" label="Tile Gaps"
               description="This says whether to separate different colors with spaces needed to prevent bleed crossover. Leave on unless you really know you want it."/>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Tiles</Typography>
        <Input name="stock.cell.width" label="Cell Width" dimension={true}
               description="This determines the default width of one stock market cell."/>
        <Input name="stock.cell.height" label="Cell Height" dimension={true}
               description="This determines the default height of one stock market cell."/>
        <Input name="stock.column" label="Column Height"
               description="This determines how many cells make up a 1D market column height. The default is 4. Decimals are allowed."/>
        <Input name="stock.diag" label="Diag Height"
               description="This determines how many cells make up a 1Diag market cell height. The default is 2. Decimals are allowed."/>
        <Input name="stock.par" label="Par Width"
               description="This determines how many cells make up a par market cell width. The default is 4. Decimals are allowed."/>
        <Input name="stock.display.legend" label="Display Market Legend"
               description="Whether or not to show the legend on markets. Requires the game file to specify the location for 2D market legends." />
        <Input name="stock.display.par" label="Display Market Par Chart"
               description="Whether or not to show the par chart on markets. Requires the game file to specify the location." />
        <Input name="stock.display.roundTracker" label="Display Market Round Tracker"
               description="Whether or not to show the round tracker on markets. Requires the game file to specify the location." />
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Charters</Typography>
        <Input name="charters.style" label="Charter Style"
               description="This lets you choose between two styles for charters. One is simular to Carth's style while the other includes more color at the top."/>
        <Input name="charters.halfWidth" label="Half Width Charters"
               description="This draws all charters (major and minor) as half width. They will take up half of the width of your page (minus cutlines)."/>
        <Input name="charters.cutlines" label="Charter Cutlines Size" dimension={true}
               description="Set to 0 to disable any cutlines and have the charters next to each other"/>
        <Input name="charters.bleed" label="Charter Bleed Size" dimension={true}
               description="Set to 0 to disable any bleed, or set to a value to have a margin of this amount used as the bleed amount for printing."/>
        <Input name="charters.border" label="Charter Border Size"
               description="Set to 0 to disable any border, or set to a value to have a border of that many pixels drawn around the charter."/>
        <Input name="charters.blackBand" label="Charter Black Band"
               description="Whether or not to put a black border against the color section of the charter. Only relevent to &quot;color&quot; charters. Always put on white color charters."/>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Cards</Typography>
        <Input name="cards.shareStyle" label="Share Style"
               description="This lets you choose between two styles for shares. One keeps the token in the center of the card, the other puts the tokens on the let (Simular to All Aboard Games and Deep Thought Games)."/>
        <Input name="cards.layout" label="Cards Layout"
               description="Free allows cards to free flow and uses the other options below. Mini euro is for my custom die that cuts mini-euro sized cards and dtgDie uses the standard Deep Thought Games asset die. Either die option overrides the page size as well as the width, height and cutlines option below."/>
        <Input name="cards.width" label="Card Width" dimension={true} />
        <Input name="cards.height" label="Card Height" dimension={true} />
        <Input name="cards.cutlines" label="Card Cutlines Size" dimension={true}
               description="Set to 0 to disable any cutlines and have the cards next to each other"/>
        <Input name="cards.bleed" label="Card Bleed Size" dimension={true}
               description="Set to 0 to disable any bleed, or set to a value to have a margin of this amount used as the bleed amount for printing."/>
        <Input name="cards.border" label="Card Border Size"
               description="Set to 0 to disable any border, or set to a value to have a border of that many pixels drawn around the card."/>
        <Input name="cards.blackBand" label="Card Black Band"
               description="Whether or not to put a black border against the color section of the share. Only relevent to &quot;gmt&quot; and &quot;left&quot; shares as well as trains. Always put on white color cards."/>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Trains</Typography>
        <Input name="trains.style" label="Train Style"
               description="Different styles of train cards. Color uses a large color band, while the number style uses a colored number for the train name." />
        <Input name="trains.images" label="Train Images"
               description="Whether or not to put some train images on the cards" />
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">IPO</Typography>
        <Input name="ipo.borderRadius" label="IPO Border Radius" dimension={true}
               description="How much to round the corners, zero will disable rounded corners on the IPO cards" />
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Currency</Typography>
        <Typography variant="body1">
          This lets you turn on currency symbols for each item individually. Only works if the game file specificies values as numbers and not strings.
        </Typography>
        <Input name="currency.bank" label="Bank" description="Bank total on revenue page"/>
        <Input name="currency.border" label="Border" description="Costs written on map borders"/>
        <Input name="currency.capital" label="Capital" description="Player capital list on revenue page"/>
        <Input name="currency.market" label="Market" description="Stock market cells"/>
        <Input name="currency.offboard" label="Offboard" description="Offboard values on maps"/>
        <Input name="currency.par" label="Par" description="Stock market par boxes"/>
        <Input name="currency.private" label="Private" description="Private costs and revenue on cards"/>
        <Input name="currency.revenue" label="Revenue" description="Revenue tracker cells"/>
        <Input name="currency.terrain" label="Terrain" description="Terrain costs on maps and track tiles"/>
        <Input name="currency.token" label="Token" description="Token costs on charters"/>
        <Input name="currency.train" label="Train" description="Train costs on cards and charters"/>
        <Input name="currency.treasury" label="Treasury" description="Companies starting capital on charters"/>
        <Input name="currency.value" label="Value" description="Values on maps and track tiles"/>
      </Box>

      <Divider/>

      <Box className={classes.configSection}>
        <Typography variant="h5">Data</Typography>
        <Typography variant="body1">
          You can remove any custom settings and revert back to the defaults with this button.
        </Typography>
        <Button onClick={resetConfig} variant="contained" color="secondary">Reset To Defaults</Button>
        <Typography variant="body1">
          These values are saved on this browser in local storage.
        </Typography>
        <Typography variant="h5">JSON</Typography>
        <Typography variant="body1">
          You can copy and paste this json value into the file in src/config.json if you want to apply these settings to command line or local servers.
        </Typography>
        <pre>
          <code>
            {JSON.stringify(diff(defaultConfig, config), null, 2)}
          </code>
        </pre>
        <File data={diff(defaultConfig, config)}
              filename="config.json">
          Download config.json
        </File>
      </Box>
    </Box>
  );
};

export default Config;
