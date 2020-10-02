const fs = require('fs-extra');
const execa = require('execa');

const excutionMode = {
  local: require('./executionMode/local'),
  remote: require('./executionMode/remote'),
};
const inputMode = {
  http: require('./inputMode/http'),
  invoke: require('./inputMode/invoke'),
  sqs: require('./inputMode/sqs'),
  sns: require('./inputMode/sns'),
};

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

async function getSamples(selectedFunction) {
  try {
    const testFolder = `${process.cwd()}/test`;
    const handler = selectedFunction.handler.split('/');
    const file = `${testFolder}/${selectedFunction.aggregate}/sample/${handler[handler.length-1].split('.')[0]}.json`;
    const samples = await fs.readJSON(file);
    const samplesOps = Object.keys(samples);
    if (samplesOps.length === 0) return {};
    return samples;
  } catch (error) {
    console.log('WARNING: Invalid sample file');
    return {};
  }
}

function selectSample(samples, sampleName, mode) {
  let selectedSample = samples[sampleName];
  if (!selectedSample) {
    if (sampleName === 'default') {
      console.log('WARNING: Missing default sample. Using empty payload');
      selectedSample = { payload: {}, meta: {} };
    } else throw new Error(`Invalid sample: ${sampleName}`);
  }
  const { payload = {}, meta = {} } = selectedSample;
  if (!meta.source) meta.source = 'ebased-workbench';
  if (!meta.trackingTag) meta.trackingTag = `ebased-${mode}-${Date.now()}`;
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