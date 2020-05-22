const is = require('ramda/src/is');
const map = require('ramda/src/map');

const compileMarket = stock => {
  let market = stock.market;

  let twoD = is(Array, market[0]);

  if (twoD) {
    return map(r => ({
      row: map(cell => ({
        value: cell ? `${cell.value ? cell.value : (cell.label ? cell.label : cell)}${cell.par ? 'p' : ''}${(cell.legend !== undefined) ? ['y', 'o', 'b'][cell.legend] : ''}` : '#{}'
      }), r)
    }), market)
  }

  return [{
    row: map(cell => ({
      value: cell ? `${cell.value ? cell.value : (cell.label ? cell.label : cell)}${cell.par ? 'p' : ''}${(cell.legend !== undefined) ? ['y', 'o', 'b'][cell.legend] : ''}` : '#{}'
    }), market)
  }]
}

exports.compileMarket = compileMarket;
