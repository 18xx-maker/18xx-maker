import { isElectron } from "./util";
const electron = isElectron ? window.require('electron') : null;

function getDefaults(){
  return {
    loadPath: 'build/locales/{{lng}}/{{ns}}.json'
  }
}

class Backend {
  constructor(services, options = {}){
    this.init(services, options);
    this.type = 'backend';
  }

  init(services, options){
    this.services = services;
    this.options = options || getDefaults();
  }

  read(language, namespace, callback){
    let filename = this.services.interpolator.interpolate(this.options.loadPath, { lng: language, ns: namespace });

    let { err, result } = electron.ipcRenderer.sendSync('i18n', filename);
    callback(err, result);
  }
}

Backend.type = 'backend';

export default Backend;
