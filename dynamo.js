import AWS from 'aws-sdk';

export default () => {
  if (process.env.IS_OFFLINE) {
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
  }

  return new AWS.DynamoDB.DocumentClient();
};
