import { diff } from "deep-object-diff";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import {
  chain,
  complement,
  compose,
  filter,
  isEmpty,
  keys,
  map,
  path,
  split,
} from "ramda";

import File from "@/components/File";
import { SyntaxHighlighter, style } from "@/components/SyntaxHighlighter";
import Input from "@/components/config/Input";
import ThemePreview from "@/components/config/ThemePreview";
import { companyThemes, mapThemes } from "@/data";
import defaultConfig from "@/defaults.json";
import { useConfig } from "@/hooks";
import schema from "@/schemas/config.schema.json";

export const getPath = split(".");
export const getSchemaPath = compose(
  chain((n) => ["properties", n]),
  filter(complement(isEmpty)),
  split("."),
);
export const getSchema = (name) => path(getSchemaPath(name), schema);

const useStyles = makeStyles((theme) => ({
  configSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(3),
    overflow: "visible",

    "& p": {
      margin: "0",
    },
    "& > p": {
      margin: "1em 0",
    },
    "& pre + a": {
      margin: "1em 0 0 0",
    },
    "& pre": {
      margin: "0 !important",
    },
  },
  configItem: {
    minWidth: 200,
    margin: theme.spacing(3, 0, 0, 0),
  },
}));

const PinConfig = ({ prefix }) => (
  <>
    <Input
      name={`${prefix}.pins.innerRadius`}
      label="Pins Inner Radius"
      dimension={true}
      description="How big should the inner radius of the pin markers be."
    />
    <Input
      name={`${prefix}.pins.outerRadius`}
      label="Pins Outer Radius"
      dimension={true}
      description="How big should the outer radius of the pin markers be."
    />
    <Input
      name={`${prefix}.pins.y`}
      label="Pin Y Location"
      dimension={true}
      description="How far from the edge of the paper should both pins be placed."
    />
    <Input
      name={`${prefix}.pins.x1`}
      label="Pins X1 Location"
      dimension={true}
      description="How far from the edge of the paper should the first pin be placed."
    />
    <Input
      name={`${prefix}.pins.x2`}
      label="Pins X2 Location"
      dimension={true}
      description="How far from the edge of the paper should the second pin be placed."
    />
  </>
);

const Config = () => {
  const classes = useStyles();
  const { config, setConfig, resetConfig } = useConfig();

  let setOption = (event) =>
    setConfig({ ...config, [event.target.name]: event.target.value });

  return (
    <Box>
      <Box className={classes.configSection}>
        <Typography variant="h5">Colors and Companies</Typography>
        <FormControl variant="filled" className={classes.configItem}>
          <InputLabel id="theme-label">Theme</InputLabel>
          <Select
            id="theme"
            name="theme"
            labelId="theme-label"
            value={config.theme}
            onChange={setOption}
          >
            {map(
              (theme) => (
                <MenuItem key={theme} value={theme}>
                  {mapThemes[theme].name}
                </MenuItem>
              ),
              keys(mapThemes),
            )}
          </Select>
        </FormControl>
        <ThemePreview />
        <Typography variant="caption" display="block" gutterBottom>
          The theme determines which colors are used for all of the elements on
          the maps and tiles.
        </Typography>

        <FormControl variant="filled" className={classes.configItem}>
          <InputLabel id="companies-theme-label">Companies Theme</InputLabel>
          <Select
            id="companies-theme"
            name="companiesTheme"
            labelId="companies-theme-label"
            value={config.companiesTheme}
            onChange={setOption}
          >
            {map(
              (theme) => (
                <MenuItem key={theme} value={theme}>
                  {companyThemes[theme].name}
                </MenuItem>
              ),
              keys(companyThemes),
            )}
          </Select>
        </FormControl>
        <ThemePreview companies />
        <Typography variant="caption" display="block" gutterBottom>
          The company theme determines which colors are used for all of the
          elements on the maps and tiles.
        </Typography>

        <Input
          name="companySvgLogos"
          label="Company Logos"
          description="This lets you choose to use SVG logos (when available) for companies instead of only colors and text. The different settings are explained on the [logos doc](/docs/logos) page"
        />
        <Input
          name="overrideCompanies"
          label="Override Companies"
          description="This lets you change the companies for a game to a set list that are defined in [the code](https://github.com/18xx-maker/18xx-maker/tree/master/src/data/companies)"
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Export</Typography>
        <Input
          name="export.allLayouts"
          label="Export all layout options"
          description="When exporting pdf components with multiple layout options, should we just export all of them?"
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Layout</Typography>
        <Input
          name="margin"
          label="Margin Size"
          dimension={true}
          description="How much of a margin exists around the printed item."
        />
        <Input
          name="cutlines"
          label="Pagination Cutlines Size"
          dimension={true}
          description="Set to 0 to disable any cutlines."
        />
        <Input
          name="cutlinesOffset"
          label="Pagination Cutlines Offset"
          dimension={true}
          description="If your method of cutting has a guide that is slightly off from where it cuts, you can adjust an offset here. Leave at 0 otherwise."
        />
        <Input
          name="bleed"
          label="Pagination Bleed Size"
          dimension={true}
          description="Set to 0 to disable any bleed. For paginated items this detemines how much map pages overlap to help with cutting errors."
        />
        <Input name="paper.width" label="Paper Width" dimension={true} />
        <Input name="paper.height" label="Paper Height" dimension={true} />
        <Input name="paper.margins" label="Paper Margins" dimension={true} />
        <Typography variant="caption" display="block" gutterBottom>
          For reference US Letter size would be 8.5in by 11in. A4 is 210mm by
          297mm.
        </Typography>
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Tokens</Typography>
        <Input
          name="tokens.layout"
          label="Token Layout"
          description="This lets you choose between different layouts when printing tokens. GSP matches the GarageSalePup AWE label sheets and overrides the values below."
        />
        <Input
          name="tokens.marketTokenSize"
          label="Market Token Size"
          dimension={true}
          description="Size of the market tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."
        />
        <Input
          name="tokens.stationTokenSize"
          label="Station Token Size"
          dimension={true}
          description="Size of the station tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."
        />
        <Input
          name="tokens.generalTokenSize"
          label="General Token Size"
          dimension={true}
          description="Size of the tokens specified for the game. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."
        />
        <Input
          name="tokens.reverseMarketTokens"
          label="Reverse Market Tokens"
          description="Whether to print token stickers for the reverse side of company market tokens. All will print a reverse token for all market tokens (normally 3 or 2 depending on the games settings)."
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Maps</Typography>
        <Input
          name="coords"
          label="Coordinate Type"
          description="This lets you choose where the coordinates appear on the map (if at all)."
        />
        <Input
          name="straightCityNames"
          label="Straight City Names"
          description="Draw city names straight instead of curved along the city. None of the games included with this tool are meant to be drawn this way so layout issues might be present."
        />
        <Input
          name="plainMapCompanies"
          label="Plain Map Company Spaces"
          description="This sets all home/destination/token spots on maps to be empty white cities with black company text instead of colored or using logos."
        />
        <Input
          name="maps.market"
          label="Display Map Market"
          description="Whether or not to show the market on the map. Requires the game file to specify the location."
        />
        <Input
          name="maps.players"
          label="Display Map Players Table"
          description="Whether or not to show the player information table on maps. This includes bank and certificate limit information. Requires the game file to specify the location."
        />
        <Input
          name="maps.roundTracker"
          label="Display Map Round Tracker"
          description="Whether or not to show the round tracker on maps. Requires the game file to specify the location."
        />
        {/* This option isn't working yet, will add later */}
        {/* <Checkbox name="plainMapDestinations" label="Plain Map Destination Spaces" */}
        {/*           description="This sets all destination spots on maps to be empty white cities with black company text:" /> */}
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Tiles</Typography>
        <Input
          name="tiles.id"
          label="Tile ID Location"
          description="This determines where to render the tile id"
        />
        <Input
          name="tiles.colorblind"
          label="Colorblind IDs"
          description="This adds a colorblind safe shape indicating the tile color to the ID section of the tile"
        />
        <Input
          name="tiles.layout"
          label="Tile Sheet Layout"
          description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and die is meant from the custom die cutters that Deep Thought Games uses. Setting either die option overrides page size and the tile size option below."
        />
        <Input
          name="tiles.width"
          label="Tile Width"
          dimension={true}
          description="This determines the default size of tiles. It defines the distance from flat to flat. 1.5in would be standard 18xx size. 1.0625in is small (1822 / 18OE) size. GMT uses 1.75in."
        />
        <Input
          name="tiles.mapWidth"
          label="Map Tile Width"
          dimension={true}
          description="This determines the default size of map hexes. This is if you want your maps drawn bigger than your tiles. Depending on how you cut your tiles this can help a lot."
        />
        <Input
          name="tiles.gaps"
          label="Tile Gaps"
          description="This says whether to separate different colors with spaces needed to prevent bleed crossover. Leave on unless you really know you want it."
        />
        <PinConfig prefix="tiles" />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Market</Typography>
        <Input
          name="stock.cell.width"
          label="Cell Width"
          dimension={true}
          description="This determines the default width of one stock market cell."
        />
        <Input
          name="stock.cell.height"
          label="Cell Height"
          dimension={true}
          description="This determines the default height of one stock market cell."
        />
        <Input
          name="stock.value"
          label="Value Location"
          description="This determines if the value of a cell is drawn at the top of borrom."
        />
        <Input
          name="stock.arrows"
          label="Arrow Location"
          description="This determines if the arrows in a cell are positioned at the top, middle or bottom."
        />
        <Input
          name="stock.column"
          label="Column Height"
          description="This determines how many cells make up a 1D market column height. The default is 4. Decimals are allowed."
        />
        <Input
          name="stock.diag"
          label="Diag Height"
          description="This determines how many cells make up a 1Diag market cell height. The default is 2. Decimals are allowed."
        />
        <Input
          name="stock.par"
          label="Par Width"
          description="This determines how many cells make up a par market cell width. The default is 4. Decimals are allowed."
        />
        <Input
          name="stock.display.legend"
          label="Display Market Legend"
          description="Whether or not to show the legend on markets. Requires the game file to specify the location for 2D market legends."
        />
        <Input
          name="stock.display.par"
          label="Display Market Par Chart"
          description="Whether or not to show the par chart on markets. Requires the game file to specify the location."
        />
        <Input
          name="stock.display.roundTracker"
          label="Display Market Round Tracker"
          description="Whether or not to show the round tracker on markets. Requires the game file to specify the location."
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Charters</Typography>
        <Input
          name="charters.style"
          label="Charter Style"
          description="This lets you choose between two styles for charters. One is simular to Carth's style while the other includes more color at the top."
        />
        <Input
          name="charters.layout"
          label="Charter Layout"
          description="Free tries to fill your page with two charters per page (by default, half width charters will change this). 3x1 and 3x2 are both designs that fit common die layouts. Either die option overrides the page size as well as the width, height and cutlines option below."
        />
        <Input
          name="charters.halfWidth"
          label="Half Width Charters"
          description="This draws all charters (major and minor) as half width. They will take up half of the width of your page (minus cutlines)."
        />
        <Input
          name="charters.smallerMinors"
          label="Smaller Minors"
          description="This draws minor charters smaller (height wise)."
        />
        <Input
          name="charters.cutlines"
          label="Charter Cutlines Size"
          dimension={true}
          description="Set to 0 to disable any cutlines and have the charters next to each other"
        />
        <Input
          name="charters.bleed"
          label="Charter Bleed Size"
          dimension={true}
          description="Set to 0 to disable any bleed, or set to a value to have a margin of this amount used as the bleed amount for printing."
        />
        <Input
          name="charters.border"
          label="Charter Border Size"
          description="Set to 0 to disable any border, or set to a value to have a border of that many pixels drawn around the charter."
        />
        <Input
          name="charters.showPhaseChart"
          label="Show Phase Chart"
          description="Whether or not to show the phase chart on charters."
        />
        <Input
          name="charters.showTurnOrder"
          label="Show Turn Order"
          description="Whether or not to show the turn order on charters."
        />
        <Input
          name="charters.blackBand"
          label="Charter Black Band"
          description='Whether or not to put a black border against the color section of the charter. Only relevent to "color" charters. Always put on white color charters.'
        />
        <PinConfig prefix="charters" />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Cards</Typography>
        <Input
          name="cards.shareStyle"
          label="Share Style"
          description="This lets you choose between two styles for shares. One keeps the token in the center of the card, the other puts the tokens on the let (Simular to All Aboard Games and Deep Thought Games)."
        />
        <Input
          name="cards.layout"
          label="Cards Layout"
          description="Free allows cards to free flow and uses the other options below. Mini euro is for my custom die that cuts mini-euro sized cards and dtgDie uses the standard Deep Thought Games asset die. Either die option overrides the page size as well as the width, height and cutlines option below."
        />
        <Input name="cards.width" label="Card Width" dimension={true} />
        <Input name="cards.height" label="Card Height" dimension={true} />
        <Input
          name="cards.cutlines"
          label="Card Cutlines Size"
          dimension={true}
          description="Set to 0 to disable any cutlines and have the cards next to each other"
        />
        <Input
          name="cards.bleed"
          label="Card Bleed Size"
          dimension={true}
          description="Set to 0 to disable any bleed, or set to a value to have a margin of this amount used as the bleed amount for printing."
        />
        <Input
          name="cards.dtgPadding"
          label="DTG Die Padding Size"
          dimension={true}
          description="Set to 0 to disable any padding, or set to a value to have a margin of this amount used as the padding amount per card for printing on the DTG die layout."
        />
        <Input
          name="cards.border"
          label="Card Border Size"
          description="Set to 0 to disable any border, or set to a value to have a border of that many pixels drawn around the card."
        />
        <Input
          name="cards.blackBand"
          label="Card Black Band"
          description='Whether or not to put a black border against the color section of the share. Only relevent to "gmt" and "left" shares as well as trains. Always put on white color cards.'
        />
        <PinConfig prefix="cards" />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Privates</Typography>
        <Input
          name="privates.style"
          label="Private Style"
          description="Different styles of private cards. Small uses small icons while big uses bigger ones."
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Trains</Typography>
        <Input
          name="trains.style"
          label="Train Style"
          description="Different styles of train cards. Color uses a large color band, while the number style uses a colored number for the train name."
        />
        <Input
          name="trains.images"
          label="Train Images"
          description="Whether or not to put some train images on the cards"
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Currency</Typography>
        <Typography variant="body1">
          This lets you turn on currency symbols for each item individually.
          Only works if the game file specificies values as numbers and not
          strings.
        </Typography>
        <Input
          name="currency.bank"
          label="Bank"
          description="Bank total on revenue page"
        />
        <Input
          name="currency.border"
          label="Border"
          description="Costs written on map borders"
        />
        <Input
          name="currency.capital"
          label="Capital"
          description="Player capital list on revenue page"
        />
        <Input
          name="currency.market"
          label="Market"
          description="Stock market cells"
        />
        <Input
          name="currency.offboard"
          label="Offboard"
          description="Offboard values on maps"
        />
        <Input
          name="currency.par"
          label="Par"
          description="Stock market par boxes"
        />
        <Input
          name="currency.private"
          label="Private"
          description="Private costs and revenue on cards"
        />
        <Input
          name="currency.revenue"
          label="Revenue"
          description="Revenue tracker cells"
        />
        <Input
          name="currency.terrain"
          label="Terrain"
          description="Terrain costs on maps and track tiles"
        />
        <Input
          name="currency.token"
          label="Token"
          description="Token costs on charters"
        />
        <Input
          name="currency.train"
          label="Train"
          description="Train costs on cards and charters"
        />
        <Input
          name="currency.treasury"
          label="Treasury"
          description="Companies starting capital on charters"
        />
        <Input
          name="currency.value"
          label="Value"
          description="Values on maps and track tiles"
        />
      </Box>

      <Divider />

      <Box className={classes.configSection}>
        <Typography variant="h5">Data</Typography>
        <Typography variant="body1">
          You can remove any custom settings and revert back to the defaults
          with this button.
        </Typography>
        <Button onClick={resetConfig} variant="contained" color="secondary">
          Reset To Defaults
        </Button>
        <Typography variant="body1">
          These values are saved on this browser in local storage.
        </Typography>
        <Typography variant="h5">JSON</Typography>
        <Typography variant="body1">
          You can copy and paste this json value into the file in
          src/config.json if you want to apply these settings to command line or
          local servers.
        </Typography>
        <SyntaxHighlighter style={style} language="json">
          {JSON.stringify(diff(defaultConfig, config), null, 2)}
        </SyntaxHighlighter>
        <File data={diff(defaultConfig, config)} filename="config.json">
          Download config.json
        </File>
      </Box>
    </Box>
  );
};

export default Config;
