const { Command } = require('../../helper/command');
const cli = require('../../helper/cli');
const invoke = require('../../invoke/index');

module.exports = {
  invoke: async (userArgs = []) => {
    const cmd = new Command(userArgs, [
      { key: 'functionName', names: ['-f', '--function'], required: true },
      { key: 'executionMode', names: ['-m', '--mode'], default: 'local' },
      { key: 'sample', names: ['--sample'], default: 'default' },
      { key: 'event', names: ['-e', '--event'], default: 0 },
      { key: 'stage', names: ['-s', '--stage'], default: 'dev' },
    ], {
      name: 'Invoke Function',
      description: `
    Invokes a function by its name trying to load its samples,
    and parsing the input for the event used.
    
    @Params:
      - functionName: the same name that appears in yml definition (resource name).
      - executionMode: local/remote.
      - sample: Loaded from test/sample/[handler_path].
      - event: Any of events present in yml definition.
      - stage: Sets the target stage destination for AWS dependencies. In remote mode
              also sets the function ARN.`
    });
    const { functionName, executionMode, sample, event, stage } = cmd.extract();

    const { functions } = await invoke.getFunctions(stage);
    const selectedFunction = invoke.selectFunction(functions, functionName);
    const samples = await invoke.getSamples(selectedFunction);
    const selectedSample = invoke.selectSample(samples, sample, executionMode);
    const data = invoke.getEventData(selectedFunction, event, selectedSample);
    cli.printParams(`MODE: ${executionMode} \nFUNCTION: ${selectedFunction.name}\nDATA: ${JSON.stringify(data)}`)
    await invoke.run(executionMode, selectedFunction, data);
  }
}
