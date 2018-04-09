import AWS from 'aws-sdk';

export default () => {
  let options = {};

  if (process.env.IS_OFFLINE) {
    options = {
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    };
  }

  return new AWS.DynamoDB.DocumentClient(options);
};
