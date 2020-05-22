const is = require('ramda/src/is');
const map = require('ramda/src/map');

const compileBank = game => {
  if (game.bank) {
    return {
      bankPerPlayer: false,
      bank: game.bank
    };
  }

  return {
    bankPerPlayer: true,
    bank: map(p => ({
      player: p.number,
      bank: p.bank
    }), game.players)
  }
}

const compileCertLimit = game => {
  if (game.certLimit) {
    return {
      certLimitPerPlayer: false,
      certLimit: game.certLimit
    };
  }

  return {
    certLimitPerPlayer: true,
    certLimit: map(p => ({
      player: p.number,
      certLimit: p.certLimit
    }), game.players)
  }
}

const compileStartingCash = game => {
  if (game.capital) {
    return {
      startingCashPerPlayer: false,
      startingCash: game.capital
    };
  }

  return {
    startingCashPerPlayer: true,
    startingCash: map(p => ({
      player: p.number,
      startingCash: p.capital
    }), game.players)
  }
}

exports.compileBank = compileBank;
exports.compileCertLimit = compileCertLimit;
exports.compileStartingCash = compileStartingCash;
