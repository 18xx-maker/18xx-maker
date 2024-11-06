import { splitEvery } from 'ramda';

export const splitRevenues = (rows, revenues) => {
  if(!rows || rows < 2 || revenues.length < 2) {
    return [revenues];
  } else {
    return splitEvery(Math.ceil(revenues.length / rows), revenues);
  }
};
