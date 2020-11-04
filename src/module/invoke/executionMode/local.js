const { getAccountId } = require('../../../helper/sts');
const { printResult } = require('../../../helper/cli');

module.exports = async (selectedFunction, data, globalEnvVars) => {
  const handlerPath = `${process.cwd()}/${selectedFunction.handler.split('.')[0]}`;
  const handlerName = selectedFunction.handler.split('.')[1];
  const context = await getContext();
  const envVars = await getEnvVars(selectedFunction, globalEnvVars);
  Object.keys(envVars).forEach(name => process.env[name] = envVars[name]);
  await execute(handlerPath, handlerName, data, context);
}

const execute = async (handlerPath, handlerName, data, context) => {
  const handler = require(handlerPath)[handlerName];
  await handler(data, context).then(printResult).catch(printResult);
  // decache(handlerPath);
}

const getContext = async () => {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  return { "invokedFunctionArn": `arn:aws:lambda:${region}:${await getAccountId()}` };
}

const getEnvVars = (selectedFunction, globalEnvVars) => {
  return {
    IS_LOCAL: 'true',
    AWS_LAMBDA_FUNCTION_NAME: selectedFunction.name,
    AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
    ...selectedFunction.environment,
    ...globalEnvVars,
  }
}