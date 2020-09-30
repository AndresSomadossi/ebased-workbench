const fs = require('fs-extra');
const execa = require('execa');

const excutionMode = {
  local: require('./executionMode/local'),
  remote: require('./executionMode/remote'),
};
const inputMode = {
  invoke: require('./inputMode/invoke'),
  sqs: require('./inputMode/sqs'),
  sns: require('./inputMode/sns'),
};

const serviceFolder = process.cwd();
const sampleFolder = `${serviceFolder}/test/sample`;

module.exports = {
  run,
  getFunctions,
  selectFunction,
  getSamples,
  selectSample,
  getEventData,
}

async function run(mode, selectedFunction, data) {
  const excutionModeSelected = excutionMode[mode];
  if (!excutionModeSelected) throw new Error(`Invalid mode: ${mode}`);
  await excutionModeSelected(selectedFunction, data);
}

async function getFunctions(stage) {
  const { stdout } = await execa.command(`sls print --format json -s ${stage}`).catch(e => { throw new Error(e.stdout) });
  const { functions } = JSON.parse(stdout);
  Object.keys(functions).forEach(f => {
    const splittedHanlder = functions[f].handler.split('/');
    functions[f].id = f;
    functions[f].aggregate = (splittedHanlder.length > 2) ? splittedHanlder[1] : null;
    functions[f].events = [...new Set(functions[f].events.map(evt => Object.keys(evt)).flat())];
  });
  return { functions };
}

function selectFunction(functions, functionName) {
  const selectedFunction = functions[functionName];
  if (!selectedFunction) throw new Error(`Invalid functionName: ${functionName}`);
  return selectedFunction;
}

async function getSamples({ aggregate, id }) {
  try {
    const samples = await fs.readJSON(`${sampleFolder}/${aggregate}/${id}.json`);
    const samplesOps = Object.keys(samples);
    if (samplesOps.length === 0) return {};
    return samples;
  } catch (error) {
    console.log('WARNING: Invalid sample file');
    return {};
  }
}

function selectSample(samples, sampleName) {
  let selectedSample = samples[sampleName];
  if (!selectedSample) {
    if (sampleName === 'default') {
      console.log('WARNING: Missing default sample. Using empty payload');
      selectedSample = { payload: {}, meta: {} };
    } else throw new Error(`Invalid sample: ${sampleName}`);
  }
  const { payload = {}, meta = {} } = selectedSample;
  if (!meta.source) meta.source = 'ebased-workbench';
  if (!meta.trackingTag) meta.trackingTag = `LOCAL-${Date.now()}`;
  return { payload, meta };
}

function getEventData({ events }, eventIndex, { payload, meta }) {
  if (events.length === 0) events.push('invoke');
  const selectedEvent = events[eventIndex];
  if (!selectedEvent) throw new Error(`Invalid event: ${eventIndex}`);
  const inputModeSelected = inputMode[selectedEvent];
  if (!inputModeSelected) throw new Error(`Invalid inputMode: ${selectedEvent}`);
  return inputModeSelected(payload, meta);
}