const uuid = require('uuid');

module.exports = (payload, meta) => {
  const headers = meta;
  Object.keys(headers).forEach(p =>
    headers[p] = (typeof headers[p] === 'string') ? headers[p] : JSON.stringify(headers[p]));
    
  return {
    headers,
    pathParameters: {},
    queryStringParameters: {},
    stageVariables: null,
    httpMethod: 'POST',
    resource: '/aggregate/api/{id}',
    path: '/aggregate/api/aabbcc',
    body: JSON.stringify(payload),
  };
}