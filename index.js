import getAllGithubData from './github';
import initDynamoDb from './dynamo';

const dynamoDb = initDynamoDb();

const formResponse = (body, statusCode = 200) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(body)
});

export const deliverGithub = (event, context, callback) => {
  dynamoDb.get(
    {
      TableName: process.env.GITHUB_TABLE,
      Key: {
        dataId: 'github'
      }
    },
    (error, result) => {
      if (error) {
        callback(null, formResponse({ error: 'Could not get data' }, 400));
      } else {
        if (result && result.Item) {
          const query = event.queryStringParameters;
          let data = JSON.parse(result.Item.data);

          if (query && query.scope) {
            data = {
              [query.scope]: data[query.scope]
            };
          }

          callback(null, formResponse(data));
        } else {
          callback(null, formResponse({ error: 'Data not found' }, 404));
        }
      }
    }
  );
};

export const updateGithub = (event, context, callback) => {
  try {
    getAllGithubData().then(data => {
      dynamoDb.put(
        {
          TableName: process.env.GITHUB_TABLE,
          Item: {
            dataId: 'github',
            data: JSON.stringify(data)
          }
        },
        error => {
          if (error) {
            callback(null, formResponse({ error }, 400));
          } else {
            callback(null, formResponse(data));
          }
        }
      );
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};
