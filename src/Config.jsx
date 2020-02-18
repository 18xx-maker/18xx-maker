import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { connect } from "react-redux";

import { diff } from "deep-object-diff";

import { setConfig } from "./store/actions";
import ColorContext from "./context/ColorContext";

import defaultConfig from "./defaults.json";
import customConfig from "./config.json";
import schema from "./data/schemas/config.schema.json";

import Color from "./data/Color";

import assocPath from "ramda/src/assocPath";
import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import complement from "ramda/src/complement";
import filter from "ramda/src/filter";
import isEmpty from "ramda/src/isEmpty";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import mergeDeepRight from "ramda/src/mergeDeepRight";
import path from "ramda/src/path";
import split from "ramda/src/split";

import mapThemes from "./data/themes/maps";
import companyThemes from "./data/themes/companies";

import "./Config.scss";

export const getPath = split('.');
export const getSchemaPath = compose(chain(n => ['properties', n]),
                                     filter(complement(isEmpty)),
                                     split('.'));
export const getSchema = name => path(getSchemaPath(name), schema);

const allUnits = {
  inches: 100.0,
  mm: 3.937007874
};

// Component to help input units
const UnitInput = ({name, value, onChange}) => {
  let [units, setUnits] = useState("inches");
  let [internalValue, setInternalValue] = useState(value / allUnits[units]);

  useEffect(() => {
    setInternalValue(value / allUnits[units]);
  }, [value, units]);

  let handler = event => {
    setInternalValue(event.target.value);
    onChange(event.target.value * allUnits[units]);
  };

  let unitsHandler = event => {
    setUnits(event.target.value);
    setInternalValue(value / allUnits[event.target.value]);
  };

  return (
    <>
      <input style={{textAlign: "right", width:"0.5in"}} type="number"
             id={name} name={name}
             value={internalValue}
             onChange={handler}/>
      <select id={`${name}-units`} value={units} onChange={unitsHandler}>
        {map(key => <option key={key} value={key}>{key}</option>, keys(allUnits))}
      </select>
    </>
  );
};

const inputState = (state , {name}) => ({
  config: state.config,
  value: path(split('.', name), state.config)
});
const inputDispatch = dispatch => ({
  setConfig: config => dispatch(setConfig(config))
});

const _Input = ({name, label, description, config, value, setConfig, dimension}) => {
  let valuePath = getPath(name);
  let rawUpdate = value => setConfig(assocPath(valuePath,value,config));
  let update = event => setConfig(assocPath(valuePath,
                                           event.target.type === "checkbox" ?
                                           event.target.checked :
                                           event.target.value,
                                           config));

  let inputSchema = getSchema(name);
  let inputNode = null;

  let [tempValue, setTempValue] = useState(value);
  useEffect(() => {
    setTempValue(value);
  }, [value]); // Only re-run the effect if value changes

  if (inputSchema && inputSchema.type === "string") {
    if (inputSchema.enum) {
      inputNode = (
        <>
          <label htmlFor={name}>{label}: </label>
          <select id={name} name={name}
                  value={value}
                  onChange={update}>
            {map(opt => <option key={opt} value={opt}>{opt}</option>,
                 inputSchema.enum)}
          </select>
        </>
      );
    } else {
      inputNode = (
        <>
          <label htmlFor={name}>{label}: </label>
          <input style={{width:"4in"}} type="text"
                 id={name} name={name}
                 value={tempValue}
                 onChange={event => setTempValue(event.target.value)}
                 onBlur={update}/>
        </>
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    inputNode = (
      <label><input id={name} name={name} type="checkbox" checked={value} onChange={update}/> {label}</label>
    );
  } else {
    inputNode = (
      <>
        <label htmlFor={name}>{label}: </label>
        {dimension ? (
          <UnitInput name={name} value={value} onChange={rawUpdate}/>
        ) : (
          <input style={{width:"0.5in"}} type="number"
                 id={name} name={name}
                 value={value}
                 onChange={update}/>
        )}
      </>
    );
  }

  return (
    <div id={`config-${name}`} className="input">
      {inputNode}
      <ReactMarkdown className="description" source={description}/>
    </div>
  );
};
const Input = connect(inputState, inputDispatch)(_Input);

const ThemePreview = () => {
  return (
    <div className="preview-bar">
      <Color>
        {c => map(color => (
          <div key={color} className="preview" style={{backgroundColor: c(color)}}/>
        ), ["yellow", "green", "brown", "gray",
            "plain", "offboard", "mountain", "water", "river", "land"])}
      </Color>
    </div>
  );
};

const CompaniesThemePreview = () => {
  return (
    <div className="preview-bar">
      <ColorContext.Provider value="companies">
        <Color>
          {c => map(color => (
            <div key={color} className="preview" style={{backgroundColor: c(color)}}/>
          ), ["black", "blue", "brightGreen", "brown", "gold", "gray", "green",
              "lavender", "lightBlue", "lightBrown", "lime", "navy", "natural",
              "orange", "pink", "red", "turquoise", "violet", "white", "yellow"])}
        </Color>
      </ColorContext.Provider>
    </div>
  );
};

const Config = ({config, setConfig, resetConfig}) => {
  let setOption = event => setConfig({ ...config, [event.target.name]: event.target.value });

  return (
    <div className="config">
      <h2>Config</h2>
      <p>Here you can set any options for how to lay out and render these 18xx games.</p>
      <h3>Colors</h3>
      <label htmlFor="theme">Theme: </label>
      <select id="theme" name="theme" value={config.theme} onChange={setOption}>
        {map(theme => <option key={theme} value={theme}>{mapThemes[theme].name}</option>, keys(mapThemes))}
      </select>
      <ThemePreview/>
      <p className="description">The theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <label htmlFor="companiesTheme">Companies Theme: </label>
      <select id="companiesTheme" name="companiesTheme" value={config.companiesTheme} onChange={setOption}>
        {map(theme => <option key={theme} value={theme}>{companyThemes[theme].name}</option>, keys(companyThemes))}
      </select>
      <CompaniesThemePreview/>
      <p className="description">The company theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <h3>Layout</h3>
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
      <p>For reference US Letter size would be 8.5in by 11in. A4 is 210mm by 297mm.</p>
      <h3>Tokens</h3>
      <Input name="tokens.layout" label="Token Layout"
             description="This lets you choose between different layouts when printing tokens. GSP matches the GarageSalePup AWE label sheets and overrides the values below."/>
      <Input name="tokens.marketTokenSize" label="Market Token Size" dimension={true}
             description="Size of the market tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."/>
      <Input name="tokens.stationTokenSize" label="Station Token Size" dimension={true}
             description="Size of the station tokens. 0.5 inches is the default. 12mm and 10mm are good sizes for the Rails on Boards tokens."/>
      <Input name="tokens.reverseMarketTokens" label="Reverse Market Tokens"
             description="Whether to print token stickers for the reverse side of company market tokens. All will print a reverse token for all market tokens (normally 3 or 2 depending on the games settings)."/>
      <h3>Companies</h3>
      <Input name="companySvgLogos" label="Company Logos"
             description="This lets you choose to use SVG logos (when available) for companies instead of only colors and text. The different settings are explained on the [logos doc](/docs/logos) page" />
      <Input name="overrideCompanies" label="Override Companies"
             description="This lets you change the companies for a game to a set list that are defined in [the code](https://github.com/kelsin/18xx/tree/master/src/data/companies)" />
      <h3>Maps</h3>
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
      <h3>Tiles</h3>
      <Input name="tiles.layout" label="Tile Sheet Layout"
             description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and die is meant from the custom die cutters that Deep Thought Games uses. Setting either die option overrides page size and the tile size option below."/>
      <Input name="tiles.width" label="Tile Width" dimension={true}
             description="This determines the default size of tiles. It defines the distance from flat to flat. 1.5in would be standard 18xx size. 1.0625in is small (1822 / 18OE) size. GMT uses 1.75in."/>
      <Input name="tiles.mapWidth" label="Map Tile Width" dimension={true}
             description="This determines the default size of map hexes. This is if you want your maps drawn bigger than your tiles. Depending on how you cut your tiles this can help a lot."/>
      <Input name="tiles.gaps" label="Tile Gaps"
             description="This says whether to separate different colors with spaces needed to prevent bleed crossover. Leave on unless you really know you want it."/>
      <h3>Stock Markets</h3>
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
      <h3>Charters</h3>
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
      <h3>Cards</h3>
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
      <h3>Trains</h3>
      <Input name="trains.style" label="Train Style"
             description="Different styles of train cards. Color uses a large color band, while the number style uses a colored number for the train name." />
      <Input name="trains.images" label="Train Images"
             description="Whether or not to put some train images on the cards" />
      <h3>IPO</h3>
      <Input name="ipo.borderRadius" label="IPO Border Radius" dimension={true}
             description="How much to round the corners, zero will disable rounded corners on the IPO cards" />
      <h3>Currency</h3>
      <p>This lets you turn on currency symbols for each item individually. Only works if the game file specificies values as numbers and not strings.</p>
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
      <h2>Config Data</h2>
      <p>You can remove any custom settings and revert back to the defaults with this button.</p>
      <button onClick={resetConfig}>Reset To Defaults</button>
      <p>These values are saved on this browser in local storage.</p>
      <h3>JSON</h3>
      <p>You can copy and paste this json value into the file in src/config.json if you want to apply these settings to command line or local servers.</p>
      <pre>
        <code>
          {JSON.stringify(diff(defaultConfig, config), null, 2)}
        </code>
      </pre>
    </div>
  );
};

const mapStateToProps = state => ({
  config: state.config
});

const mapDispatchToProps = dispatch => ({
  setConfig: config => dispatch(setConfig(config)),
  resetConfig: () => dispatch(setConfig(mergeDeepRight(defaultConfig, customConfig)))
});

export default connect(mapStateToProps, mapDispatchToProps)(Config);
