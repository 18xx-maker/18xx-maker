import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { setConfig } from "./store/actions";

import defaultConfig from "./config.json";
import schema from "./data/schemas/config.schema.json";

import map from "ramda/src/map";

import "./Config.scss";

const inputState = (state , {name}) => ({
  config: state.config,
  value: state.config[name]
});
const inputDispatch = dispatch => ({
  setConfig: config => dispatch(setConfig(config))
});
const _Input = ({name, label, description, config, value, setConfig}) => {
  let setOption = event => setConfig({ ...config, [event.target.name]: event.target.value });
  let setCheckbox = event => setConfig({ ...config, [event.target.name]: event.target.checked });

  let inputSchema = schema.properties[name];
  let inputNode = null;

  let [tempValue, setTempValue] = useState(value);
  useEffect(() => {
    setTempValue(value);
  }, [value]); // Only re-run the effect if count changes

  if (inputSchema.type === "string") {
    if (inputSchema.enum) {
      inputNode = (
        <>
          <label htmlFor={name}>{label}: </label>
          <select id={name} name={name}
                  value={value}
                  onChange={setOption}>
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
                 onBlur={setOption}/>
        </>
      );
    }
  } else if (inputSchema.type === "boolean") {
    inputNode = (
      <label><input id={name} name={name} type="checkbox" checked={value} onChange={setCheckbox}/> {label}</label>
    );
  }

  return (
    <div id={`config-${name}`}>
      <p>{description}</p>
      {inputNode}
    </div>
  );
};
const Input = connect(inputState, inputDispatch)(_Input);

const Config = ({config, setConfig, resetConfig}) => {
  let setOption = event => setConfig({ ...config, [event.target.name]: event.target.value });

  return (
    <div className="config">
      <h2>Config</h2>
      <p>Here you can set any options for how to lay out and render these 18xx games.</p>
      <h3>Theme</h3>
      <p>The theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <select name="scheme" value={config.scheme} onChange={setOption}>
        <option value="gmt">GMT</option>
        <option value="dtg">Deep Thought</option>
        <option value="aag">All Aboard Games</option>
        <option value="ps18xx">px18xx</option>
        <option value="carth">Carth</option>
      </select>
      <h3>Layout</h3>
      <Input name="pagination" label="Pagination Type"
             description="This lets you configure the type of pagination. Equal keeps all pages directly equal. Max keeps the first and last page equal and set all middle pages to max based on page size."/>
      <Input name="shareLayout" label="Share Layout"
             description="This lets you choose between two layouts for shares. One keeps the token in the center of the card, the other puts the tokens on the let (Simular to All Aboard Games and Deep Thought Games)."/>
      <h3>Maps</h3>
      <Input name="plainMapHomes" label="Plain Map Home Spaces"
             description="This sets all home spots on maps to be empty white cities with black company text instead of colored or using logos." />
      {/* This option isn't working yet, will add later */}
      {/* <Checkbox name="plainMapDestinations" label="Plain Map Destination Spaces" */}
      {/*           description="This sets all destination spots on maps to be empty white cities with black company text:" /> */}
      {/* This option isn't working yet, will add later */}
      {/* <Checkbox name="useCompanySvgLogos" label="Use Company SVG Logos" */}
      {/*           description="This will attempt to use svg images for company logos on the map and tokens if the logo is avaialable:" /> */}
      <Input name="coords" label="Coordinate Type"
             description="This lets you choose where the coordinates appear on the map (if at all)."/>
      <h3>Tiles</h3>
      <Input name="tiles" label="Tile Sheet Layout"
             description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and Die is meant from the custom Die cutters that Deep Thought Games uses"/>
      <h3>Stock Markets</h3>
      <h2>Reset</h2>
      <p>You can remove any custom settings and revert back to the defaults with this button.</p>
      <button onClick={resetConfig}>Reset To Defaults</button>
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
