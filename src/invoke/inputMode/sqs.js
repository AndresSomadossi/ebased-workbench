const uuid = require('uuid');

module.exports = (payload, meta) => {
  const region = process.env.AWS_REGION;
  messageAttributes = {};
  Object.keys(meta).forEach(metaKey => {
    const el = meta[metaKey];
    messageAttributes[metaKey] = {
      stringValue: (typeof el === 'string') ? el : JSON.stringify(el),
      dataType: 'String'
    };
  });

  return {
    Records: [{
      messageId: uuid.v4(),
      body: JSON.stringify(payload),
      messageAttributes,
      awsRegion: region,
      eventSourceARN: `arn:aws:sqs:${region}:XXXXXXXXXXXX:lambda-dev-lambdafunction`,
      receiptHandle: 'AQEB26EBzGnZDRgk/PxX/MbF8OyoRrg9oCX2i4+=',
      attributes: {
        ApproximateReceiveCount: '1',
        AWSTraceHeader: 'Root=1-5f64d4f9-5e2a2ea28add7b04f67b4b46;Parent=22a36c87cad02f46;Sampled=1',
        SentTimestamp: '1600443641978',
        SenderId: 'AIDAIT2UOQQY3AUEKVGXU',
        ApproximateFirstReceiveTimestamp: '1600443641988'
      },
      md5OfMessageAttributes: '103db6e9495da0e66a939e45202482a9',
      md5OfBody: 'e570b4082fa18ad9e7db0deca9f913b5',
      eventSource: 'aws:sqs',
    }]
  };
}