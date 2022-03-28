function getDefaults() {
  return {
    loadPath: "locales/{{lng}}/{{ns}}.json",
  };
}

class Backend {
  constructor(services, options = {}) {
    this.init(services, options);
    this.type = "backend";
  }

  init(services, options) {
    this.services = services;
    this.options = options || getDefaults();
  }

  read(language, namespace, callback) {
    let filename = this.services.interpolator.interpolate(
      this.options.loadPath,
      { lng: language, ns: namespace }
    );

    let { err, result } = window.ipc.readI18n(filename);
    callback(err, result);
  }
}

Backend.type = "backend";

export default Backend;
