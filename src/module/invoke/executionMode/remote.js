const Lambda = require('aws-sdk/clients/lambda');
const lambda = new Lambda();
const { printResult } = require('../../../helper/cli');

module.exports = async (selectedFunction, data) => {
  const params = {
    FunctionName: selectedFunction.name,
    Payload: JSON.stringify(data),
  };
  await lambda.invoke(params).promise().then(printResult).catch(e => {
    printResult(e);
  });
}