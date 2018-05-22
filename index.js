import getAllGithubData from './github';
import getAllSlackData from './slack';
import getAllGhostData from './ghost';
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
            callback(null, formResponse({ success: true }));
          }
        }
      );
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};

const filterMetadata = (query, data) => {
  if (query && query.access_token === process.env.SLACK_TOKEN) {
    data = JSON.parse(data);
  } else {
    data = {
      metadata: JSON.parse(data).metadata
    };
  }

  return data;
};

export const deliverSlack = (event, context, callback) => {
  dynamoDb.get(
    {
      TableName: process.env.SLACK_TABLE,
      Key: {
        dataId: 'slack'
      }
    },
    (error, result) => {
      if (error) {
        callback(null, formResponse({ error: 'Could not get data' }, 400));
      } else {
        if (result && result.Item) {
          const data = filterMetadata(
            event.queryStringParameters,
            result.Item.data
          );

          callback(null, formResponse(data));
        } else {
          callback(null, formResponse({ error: 'Data not found' }, 404));
        }
      }
    }
  );
};

export const updateSlack = (event, context, callback) => {
  try {
    getAllSlackData().then(data => {
      dynamoDb.put(
        {
          TableName: process.env.SLACK_TABLE,
          Item: {
            dataId: 'slack',
            data: JSON.stringify(data)
          }
        },
        error => {
          if (error) {
            callback(null, formResponse({ error }, 400));
          } else {
            callback(null, formResponse({ success: true }));
          }
        }
      );
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};

export const deliverGhost = (event, context, callback) => {
  dynamoDb.get(
    {
      TableName: process.env.GHOST_TABLE,
      Key: {
        dataId: 'ghost'
      }
    },
    (error, result) => {
      if (error) {
        callback(null, formResponse({ error: 'Could not get data' }, 400));
      } else {
        if (result && result.Item) {
          const data = JSON.parse(result.Item.data);

          callback(null, formResponse(data));
        } else {
          callback(null, formResponse({ error: 'Data not found' }, 404));
        }
      }
    }
  );
};

export const updateGhost = (event, context, callback) => {
  try {
    getAllGhostData().then(data => {
      dynamoDb.put(
        {
          TableName: process.env.GHOST_TABLE,
          Item: {
            dataId: 'ghost',
            data: JSON.stringify(data)
          }
        },
        error => {
          if (error) {
            callback(null, formResponse({ error }, 400));
          } else {
            callback(null, formResponse({ success: true }));
          }
        }
      );
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};
