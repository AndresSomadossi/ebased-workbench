#! /usr/bin/env node

const fs = require('fs-extra');
const execa = require('execa');

const excutionMode = {
  local: require('./executionMode/local'),
  remote: require('./executionMode/remote'),
};
const inputMode = {
  invoke: require('./inputMode/invoke'),
};

const serviceFolder = process.cwd();
const sampleFolder = `${serviceFolder}/test/sample`;

(async () => {
  try {
    console.log('EBASED');
    const mode = 'local';
    const { functions } = await getFunctions();
    const selectedFunction = printFunctions(functions);
    const data = await getData(selectedFunction);
    await excutionMode[mode](selectedFunction, data);
  } catch (error) {
    console.log(error);
  }
})();

async function getFunctions() {
  const { stdout } = await execa.command('sls print --format json').catch(e => { throw new Error(e.stdout) });
  const { functions } = JSON.parse(stdout);
  return { functions };
}

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

async function getData(selectedFunction) {
  const { key, aggregate, events } = selectedFunction;
  // Samples load
  const samples = await fs.readFile(`${sampleFolder}/${aggregate}/${key}.json`).then(JSON.parse);
  const samplesOps = Object.keys(samples);
  if (samplesOps.length === 0) return {};
  // Sample selection
  const { payload = {}, meta = {} } = (samplesOps.length > 1) ? selectSample(samples, samplesOps): samples[samplesOps[0]];
  if (Object.keys(meta).length === 0) meta.trackingTag = `LOCAL-${Date.now()}`;
  // Event selection and parsing
  if (events.length === 0) events.push('invoke');
  const selectedEvent = (events.length > 1) ? selectEvent(events) : events[0];
  return inputMode[selectedEvent](payload, meta);
}

function selectSample(samples, ops) {
  return samples[ops[0]];
}

function selectEvent(events) {
  return events[0];
}