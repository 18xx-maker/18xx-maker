import React from "react";
import { connect } from "react-redux";
import { setScheme } from "./store/actions";

const Themes = ({scheme, setScheme}) => {
  let handleChange = e => {
    setScheme(e.target.value);
  };

  return (
    <div className="themes">
      <h2>Themes</h2>
      <select value={scheme} onChange={handleChange}>
        <option value="gmt">GMT</option>
        <option value="dtg">Deep Thought</option>
        <option value="ps18xx">px18xx</option>
        <option value="carth">Carth</option>
        <option value="kelsin">Kelsin</option>
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

export default connect(mapStateToProps, mapDispatchToProps)(Themes);
