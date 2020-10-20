const SSM = require('aws-sdk/clients/ssm');
const ssm = new SSM();

const getParameter = async ({ Name }) => {
  const { Parameter } = await ssm.getParameter({ Name, WithDecryption: true }).promise().catch(e => ({ Parameter: { Value: e.message } }));
  try {
    return { ...Parameter, Value: JSON.parse(Parameter.Value), isJSON: true };
  } catch (error) {
    return { ...Parameter, isJSON: false }
  }
}
const putParameter = async ({ Name, Value }) => {
  if (typeof Value !== 'string') Value = JSON.stringify(Value);
  return ssm.putParameter({ Name, Value, Overwrite: true, Type: 'SecureString' }).promise();
}

module.exports = {
  getParameter,
  putParameter,
}