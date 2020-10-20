const { Command } = require('../../../helper/command');
const cli = require('../../../helper/cli');
const invoke = require('../../invoke/index');
const config = require('../index');

module.exports = {
  config: async (userArgs = []) => {
    const cmd = new Command(userArgs, [
      { key: 'functionName', names: ['-f', '--function'], required: true },
      { key: 'stage', names: ['-s', '--stage'], default: 'dev' },
      { key: 'sample', names: ['--sample'], default: 'STATIC_CONFIG' },
      { key: 'origin', names: ['-o', '--origin'] },
      { key: 'print', names: ['-p', '--print'], checkPresent: true },
    ], {
      name: 'Update Function Static Config',
      description: `
    Updates a function static configs from SSM.
    The update can be performed as a copy of another env o loaded
    by a sample.
    To get a sample its key have to start with STATIC_CONFIG.

    @Params:
      - functionName: the same name that appears in yml definition (resource name).
      - stage: Stage destination for the new config
      - sample: Loaded from test/sample/[handler_path].
      - origin: Stage origin of the config
      - print: Only show de currents values of the stage given
      `
    });
    const { functionName, origin: originStage, sample, stage: destinationStage, print } = cmd.extract();
    const { functions: destinationFunctions } = await invoke.getFunctions(destinationStage);
    const destinationFunction = invoke.selectFunction(destinationFunctions, functionName);
    // Print mode
    if (print) return cli.printResult(await config.getParameter({ Name: destinationFunction.name }));
    // Mirror mode
    if (originStage) {
      const { functions: originFunctions } = await invoke.getFunctions(originStage);
      const originFunction = invoke.selectFunction(originFunctions, functionName);
      const originConfig = await config.getParameter({ Name: originFunction.name });
      cli.printParams(`<MIRRORING CONFIG>\n FUNCTION: ${functionName}\n DESTINATION: ${destinationStage}\n ORIGIN: ${originStage}`);
      await config.putParameter({ Name: destinationFunction.name, Value: originConfig.Value });
      return cli.printResult(await config.getParameter({ Name: destinationFunction.name }));
    };
    // Sample mode
    const samples = await invoke.getSamples(destinationFunction);
    const selectedSample = samples[sample];
    if (!selectedSample) throw new Error('Invalid sample');
    cli.printParams(`<UPLOADING SAMPLE CONFIG>\n FUNCTION: ${functionName}\n DESTINATION: ${destinationStage}\n SAMPLE: ${JSON.stringify(selectedSample)}`);
    await config.putParameter({ Name: destinationFunction.name, Value: selectedSample });
    return cli.printResult(await config.getParameter({ Name: destinationFunction.name }));
  }
}