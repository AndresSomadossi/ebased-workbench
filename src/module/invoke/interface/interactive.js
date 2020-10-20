function printFunctions(functions = {}) {
  // TODO: Remove duplicates Events
  const options = Object.keys(functions).map(f => ({
    ...functions[f],
    key: f,
    aggregate: functions[f].handler.split('/')[1],
    events: functions[f].events.map(evt => Object.keys(evt)).flat(),
  }));
  console.log(options);
  return options[0];
}

function selectFunction(samples, ops) {
  // TODO: CLI
  return samples[ops[0]];

}

function printSamples(samples, ops) {
  // TODO: CLI
  return samples[ops[0]];
}

function selectSample(samples, ops) {
  // TODO: CLI
  return samples[ops[0]];
}

function printEvents(events) {
  // TODO: CLI
  return events[0];
}

function selectEvent(events) {
  // TODO: CLI
  return events[0];
}