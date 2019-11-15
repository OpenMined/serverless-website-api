import AWS from 'aws-sdk';

export default () => {
  let options = {};

  if (process.env.IS_OFFLINE) {
    options = {
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    };
  }

  const client = new AWS.DynamoDB();
  const docClient = new AWS.DynamoDB.DocumentClient(options);

  return {
    client,
    dynamoDb: docClient
  };
};
