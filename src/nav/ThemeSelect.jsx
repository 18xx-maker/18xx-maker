import React from "react";
import { connect } from "react-redux";
import { setScheme } from "../store/actions";

const ThemeSelect = ({scheme, setScheme}) => {
  let handleChange = e => {
    setScheme(e.target.value);
  };

  return (
    <div className="select">
      <h3>Theme</h3>
      <select value={scheme} onChange={handleChange}>
        <option value="gmt">GMT</option>
        <option value="dtg">Deep Thought</option>
        <option value="aag">All Aboard Games</option>
        <option value="ps18xx">px18xx</option>
        <option value="carth">Carth</option>
      </select>
    </div>
  );
};

const mapStateToProps = state => ({
  scheme: state.config.scheme
});

const mapDispatchToProps = dispatch => ({
  setScheme: scheme => dispatch(setScheme(scheme))
});

export default connect(mapStateToProps, mapDispatchToProps)(ThemeSelect);
