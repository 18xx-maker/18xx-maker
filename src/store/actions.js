const SET_CONFIG = "SET_CONFIG";
const setConfig = config => ({
  type: SET_CONFIG,
  config
});

const SET_SCHEME = "SET_SCHEME";
const setScheme = scheme => ({
  type: SET_SCHEME,
  scheme
});

export { SET_CONFIG, setConfig,
         SET_SCHEME, setScheme };
