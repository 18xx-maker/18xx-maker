// Renaming a train in the editor keeps what points at it pointing at it: the
// rust, phased and obsolete events of trains, phases that give a train and the
// trains of companies. Names are matched exactly; the game is not mutated.

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// A train event is a name, { on, index } or an array of those
const renameEvent = (value, from, to) => {
  if (value === from) return to;
  if (Array.isArray(value)) {
    const next = value.map((item) => renameEvent(item, from, to));
    return next.some((item, i) => item !== value[i]) ? next : value;
  }
  if (isObject(value) && value.on === from) return { ...value, on: to };
  return value;
};

const EVENTS = ["rust", "phased", "obsolete"];

// A train definition with its events (and those of its back) rewritten
const renameDefinition = (train, from, to) => {
  if (!isObject(train)) return train;
  let next = train;
  for (const key of EVENTS) {
    const value = renameEvent(train[key], from, to);
    if (value !== train[key]) next = { ...next, [key]: value };
  }
  if (train.available === from) next = { ...next, available: to };
  const back = renameDefinition(train.back, from, to);
  if (back !== train.back) next = { ...next, back };
  return next;
};

const mapList = (list, fn) => {
  if (!Array.isArray(list)) return list;
  const next = list.map(fn);
  return next.some((item, i) => item !== list[i]) ? next : list;
};

// A company train: a name, a reference ({ name, quantity }) or a definition
const renameCompanyTrain = (entry, from, to) => {
  if (entry === from) return to;
  if (!isObject(entry)) return entry;
  if (Object.keys(entry).every((key) => key === "name" || key === "quantity")) {
    return entry.name === from ? { ...entry, name: to } : entry;
  }
  return renameDefinition(entry, from, to);
};

const renameTrain = (game, index, newName) => {
  const trains = game?.trains;
  if (!Array.isArray(trains)) return game;
  const from = trains[index]?.name;
  if (
    typeof from !== "string" ||
    typeof newName !== "string" ||
    newName.trim() === "" ||
    from === newName ||
    trains.some((train, i) => i !== index && train?.name === from)
  ) {
    return game;
  }

  const nextTrains = mapList(trains, (train) =>
    renameDefinition(train, from, newName),
  );
  const phases = mapList(game.phases, (phase) => {
    const value = isObject(phase)
      ? renameEvent(phase.train, from, newName)
      : null;
    return isObject(phase) && value !== phase.train
      ? { ...phase, train: value }
      : phase;
  });
  const companies = mapList(game.companies, (company) => {
    const list = isObject(company)
      ? mapList(company.trains, (entry) =>
          renameCompanyTrain(entry, from, newName),
        )
      : null;
    return isObject(company) && list !== company.trains
      ? { ...company, trains: list }
      : company;
  });

  if (
    nextTrains === trains &&
    phases === game.phases &&
    companies === game.companies
  ) {
    return game;
  }
  const next = { ...game };
  if (nextTrains !== trains) next.trains = nextTrains;
  if (phases !== game.phases) next.phases = phases;
  if (companies !== game.companies) next.companies = companies;
  return next;
};

export default renameTrain;
