const AWS = require('aws-sdk');
const sts = new AWS.STS();

let accountId;

module.exports.getAccountId = async () => {
  if (!accountId) {
    const { Account } = await sts.getCallerIdentity().promise();
    accountId = Account;
  }
  return accountId;
}