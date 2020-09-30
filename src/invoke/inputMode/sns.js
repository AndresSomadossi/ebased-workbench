const uuid = require('uuid');

module.exports = (payload, meta) => {
  const region = process.env.AWS_REGION;
  messageAttributes = {};
  Object.keys(meta).forEach(metaKey => {
    const el = meta[metaKey];
    messageAttributes[metaKey] = {
      Value: (typeof el === 'string') ? el : JSON.stringify(el),
      Type: 'String'
    };
  });

  return {
    Records: [{
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn: `arn:aws:sns:${region}:XXXXXXXXXXXX:topicName:subscription-id`,
      Sns: {
        MessageAttributes: messageAttributes,
        Message: JSON.stringify(payload),
        MessageId: uuid.v4(),
        Type: 'Notification',
        TopicArn: `arn:aws:sns:${region}:XXXXXXXXXXXX:topicName`,
        Timestamp: '2020-09-30T18:28:03.290Z',
        Subject: null,
        SignatureVersion: '1',
        Signature: 'SxRsI4iPsl9LuBGIBs3xKgZ4J+TBucX+99lJuEx1jqj92ojF9gEUiLkgJPFpCRUp5MdUtM2==',
        SigningCertUrl: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
        UnsubscribeUrl: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=yourtopicarn',
      }
    }]
  };
}