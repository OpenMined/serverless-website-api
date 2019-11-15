import getAllGithubData from './github';
import getAllSlackData from './slack';
import getAllGhostData from './ghost';
import initDynamoDb from './dynamo';

const { client, dynamoDb } = initDynamoDb();

const formResponse = (body, statusCode = 200) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(body)
});

const batchUpdate = (table, values, key) => {
  const allUpdates = [];

  const chunkSize = 25;
  const chunkedData = [];

  for (let i = 0; i < values.length; i += chunkSize) {
    chunkedData.push(values.slice(i, i + chunkSize));
  }

  let chunksWrittenSuccessfully = 0;

  chunkedData.forEach(arr => {
    let params = {
      RequestItems: {
        [table]: arr.map(item => ({
          PutRequest: {
            Item: {
              id: item[key],
              value: JSON.stringify(item)
            }
          }
        }))
      }
    };

    const promise = dynamoDb.batchWrite(params, error => {
      if (error) return error;

      chunksWrittenSuccessfully += 1;
    }).promise();

    allUpdates.push(promise);
  });

  Promise.all(allUpdates).then(() => {
    console.log(chunksWrittenSuccessfully, chunkedData.length);

    if(chunksWrittenSuccessfully >= chunkedData.length) return true;

    return false;
  });
};

const scanTable = async (tableName) => {
  const params = {
    TableName: tableName,
  };

  let scanResults = [];
  let items;

  do {
    items = await dynamoDb.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(JSON.parse(item.value)));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while(typeof items.LastEvaluatedKey !== "undefined");

  return scanResults;
};

export const deliverGithub = (event, context, callback) => {
  const members = scanTable(process.env.GITHUB_MEMBERS_TABLE);
  const repos = scanTable(process.env.GITHUB_REPOS_TABLE);

  Promise.all([members, repos])
    .then(data => {
      callback(null, formResponse({
        members: data[0],
        repositories: data[1]
      }));
    }).catch(error => {
      console.log(error);

      callback(null, formResponse({ error: 'Could not get data' }, 400));
    });
};

export const updateGithub = (event, context, callback) => {
  try {
    getAllGithubData().then(data => {
      const membersUpdated = batchUpdate(process.env.GITHUB_MEMBERS_TABLE, data.members, 'login');
      const reposUpdated = batchUpdate(process.env.GITHUB_REPOS_TABLE, data.repositories, 'name');

      if(typeof membersUpdated === 'boolean' && typeof reposUpdated === 'boolean' && membersUpdated && reposUpdated) {
        callback(null, formResponse({ success: true }));
      } else {
        if(typeof membersUpdated !== 'boolean') {
          callback(null, formResponse({ error: membersUpdated }, 400));
        } else if(typeof reposUpdated !== 'boolean') {
          callback(null, formResponse({ error: reposUpdated }, 400));
        }

        callback(null, formResponse({ error: 'Never finished?' }, 400));
      }
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};

export const deliverSlack = (event, context, callback) => {
  const params = event.queryStringParameters;

  if(params && params.access_token === process.env.SLACK_TOKEN) {
    const members = scanTable(process.env.SLACK_TABLE);

    Promise.all([members])
      .then(data => {
        callback(null, formResponse({
          members: data[0],
        }));
      }).catch(error => {
        console.log(error);

        callback(null, formResponse({ error: 'Could not get data' }, 400));
      });
  } else {
    client.describeTable({ TableName: process.env.SLACK_TABLE }, (error, data) => {
      console.log(error, data);

      if(error) {
        callback(null, formResponse({ error: 'Could not get data' }, 400));
      } else {
        const numMembers = data['Table']['ItemCount'];

        callback(null, formResponse({
          metadata: {
            count: numMembers
          }
        }));
      }
    });
  }
};

export const updateSlack = (event, context, callback) => {
  try {
    getAllSlackData().then(data => {
      const membersUpdated = batchUpdate(process.env.SLACK_TABLE, data.members, 'id');

      if(typeof membersUpdated === 'boolean' && membersUpdated) {
        callback(null, formResponse({ success: true }));
      } else {
        if(typeof membersUpdated !== 'boolean') {
          callback(null, formResponse({ error: membersUpdated }, 400));
        }

        callback(null, formResponse({ error: 'Never finished?' }, 400));
      }
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
