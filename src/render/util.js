const fs = require('fs');

export const setupB18 = (game, version) => {
  setupGame(game);
  let id = `${game}-${version}`;
  let folder = `board18-${id}`;
  try {
    fs.mkdirSync(`./build/render/${game}/${folder}`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  try {
    fs.mkdirSync(`./build/render/${game}/${folder}/${id}`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

export const setupGame = game => {
  try {
    fs.mkdirSync(`./build/render/${game}`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

export const setup = () => {
  try {
    fs.mkdirSync(`./build`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  try {
    fs.mkdirSync(`./build/render`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};
