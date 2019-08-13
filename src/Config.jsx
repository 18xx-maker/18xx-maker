import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { connect } from "react-redux";

import { setConfig } from "./store/actions";
import ColorContext from "./context/ColorContext";

import defaultConfig from "./config.json";
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
import path from "ramda/src/path";
import split from "ramda/src/split";

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
  }, [value]); // Only re-run the effect if count changes

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
          <input style={{width:"1in"}} type="number"
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
          ), ["red", "orange", "yellow", "green", "lime",
              "blue", "cyan", "turquoise", "purple",
              "lavender", "pink", "brown", "tan", "natural",
              "white", "gray", "black"])}
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
        <option value="aag">All Aboard Games</option>
        <option value="carth">Carth</option>
        <option value="dtg">Deep Thought</option>
        <option value="hartland">Hartland Trefoil</option>
        <option value="gmt">GMT</option>
        <option value="ps18xx">px18xx</option>
      </select>
      <ThemePreview/>
      <p className="description">The theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <label htmlFor="companiesTheme">Companies Theme: </label>
      <select id="companiesTheme" name="companiesTheme" value={config.companiesTheme} onChange={setOption}>
        <option value="carth">Carth</option>
        <option value="dtg">Deep Thought</option>
        <option value="gmt">GMT</option>
        <option value="ps18xx">px18xx</option>
        <option value="rob">Rails on Boards</option>
      </select>
      <CompaniesThemePreview/>
      <p className="description">The company theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <h3>Layout</h3>
      <Input name="pagination" label="Pagination Type"
             description="This lets you configure the type of pagination. Equal keeps all pages directly equal. Max keeps the first and last page equal and set all middle pages to max based on page size."/>
      <Input name="paper.width" label="Paper Width" dimension={true}/>
      <Input name="paper.height" label="Paper Height" dimension={true}/>
      <Input name="paper.margins" label="Paper Margins" dimension={true}/>
      <p>For reference US Letter size would be 8.5in by 11in. A4 is 210mm by 297mm.</p>
      <h3>Companies</h3>
      <Input name="tokenLayout" label="Token Layout"
             description="This lets you choose between different layouts when printing tokens. GSP matches the GarageSalePup AWE label sheets."/>
      <Input name="companySvgLogos" label="Company Logos"
             description="This lets you choose to use SVG logos (when available) for companies instead of only colors and text. The different settings are explained on the [logos doc](/docs/logos) page" />
      <h3>Maps</h3>
      <Input name="coords" label="Coordinate Type"
             description="This lets you choose where the coordinates appear on the map (if at all)."/>
      <Input name="straightCityNames" label="Straight City Names"
             description="Draw city names straight instead of curved along the city. None of the games included with this tool are meant to be drawn this way so layout issues might be present." />
      <Input name="plainMapHomes" label="Plain Map Home Spaces"
             description="This sets all home spots on maps to be empty white cities with black company text instead of colored or using logos." />
      {/* This option isn't working yet, will add later */}
      {/* <Checkbox name="plainMapDestinations" label="Plain Map Destination Spaces" */}
      {/*           description="This sets all destination spots on maps to be empty white cities with black company text:" /> */}
      <h3>Tiles</h3>
      <Input name="tiles.layout" label="Tile Sheet Layout"
             description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and Die is meant from the custom Die cutters that Deep Thought Games uses"/>
      <Input name="tiles.width" label="Tile Width" dimension={true}
             description="This determines the default size of maps and tiles. It defines the distance from flat to flat. 1.5in would be standard 18xx size. 1in is small (1822 / 18OE) size. GMT uses 1.75in."/>
      <h3>Stock Markets</h3>
      <h3>Charters</h3>
      <Input name="charterStyle" label="Charter Style"
             description="This lets you choose between two styles for charters. One is simular to Carth's style while the other includes more color at the top."/>
      <Input name="halfWidthCharters" label="Half Width Charters"
             description="This draws all charters (major and minor) as half width. They will take up half of the width of your page (minus cutlines)."/>
      <h3>Cards</h3>
      <Input name="shareStyle" label="Share Style"
             description="This lets you choose between two styles for shares. One keeps the token in the center of the card, the other puts the tokens on the let (Simular to All Aboard Games and Deep Thought Games)."/>
      <h2>Reset</h2>
      <p>You can remove any custom settings and revert back to the defaults with this button.</p>
      <button onClick={resetConfig}>Reset To Defaults</button>
      <p>These values are saved on this browser in local storage.</p>
    </div>
  );
};

const mapStateToProps = state => ({
  config: state.config
});

const mapDispatchToProps = dispatch => ({
  setConfig: config => dispatch(setConfig(config)),
  resetConfig: () => dispatch(setConfig(defaultConfig))
});

export default connect(mapStateToProps, mapDispatchToProps)(Config);
