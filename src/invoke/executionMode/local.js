const { getAccountId } = require('../../helper/sts');

module.exports = async (selectedFunction, data) => {
  const handlerPath = `${process.cwd()}/${selectedFunction.handler.split('.')[0]}`;
  const handlerName = selectedFunction.handler.split('.')[1];
  const context = await getContext();
  const envVars = await getEnvVars(selectedFunction);
  Object.keys(envVars).forEach(name => process.env[name] = envVars[name]);
  await execute(handlerPath, handlerName, data, context);
}

const execute = async (handlerPath, handlerName, data, context) => {
  const handler = require(handlerPath)[handlerName];
  await handler(data, context).then(printResult).catch(printResult);
  // decache(handlerPath);
}

const printResult = (value) => {
  console.log('===================================');
  console.log(value);
  console.log('===================================');
}

const getContext = async () => {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  return { "invokedFunctionArn": `arn:aws:lambda:${region}:${await getAccountId()}` };
}

const getEnvVars = (selectedFunction) => {
  return {
    IS_LOCAL: 'true',
    AWS_LAMBDA_FUNCTION_NAME: selectedFunction.name,
    AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
    ...selectedFunction.environment
  }
}