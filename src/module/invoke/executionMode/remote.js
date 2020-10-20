process.env.IS_LOCAL = 'true';
const { invoke } = require('ebased/service/downstream/lambda');
const { printResult } = require('../../../helper/cli');

module.exports = async (selectedFunction, data) => {
  const params = {
    FunctionName: selectedFunction.name,
    Payload: data,
  };
  await invoke(params).then(printResult).catch(e => {
    const { message, code, status } = e;
    printResult({ message, code, status }, 'es ayuda');
  });
}