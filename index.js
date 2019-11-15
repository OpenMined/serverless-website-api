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

    const promise = dynamoDb.batchWrite(params).promise();

    allUpdates.push(promise);
  });

  return Promise.all(allUpdates);
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
      callback(null, formResponse({ error }, 400));
    });
};

export const updateGithub = (event, context, callback) => {
  try {
    getAllGithubData().then(data => {
      const membersUpdated = batchUpdate(process.env.GITHUB_MEMBERS_TABLE, data.members, 'login');
      const reposUpdated = batchUpdate(process.env.GITHUB_REPOS_TABLE, data.repositories, 'name');

      Promise.all([membersUpdated, reposUpdated]).then(() => {
        callback(null, formResponse({ success: true }));
      }).catch(error => {
        callback(null, formResponse({ error }, 400));
      });
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
        callback(null, formResponse({ error }, 400));
      });
  } else {
    client.describeTable({ TableName: process.env.SLACK_TABLE }, (error, data) => {
      if(error) {
        callback(null, formResponse({ error }, 400));
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

      Promise.all([membersUpdated]).then(() => {
        callback(null, formResponse({ success: true }));
      }).catch(error => {
        callback(null, formResponse({ error }, 400));
      });
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};

export const deliverGhost = (event, context, callback) => {
  const posts = scanTable(process.env.GHOST_TABLE);

  Promise.all([posts])
    .then(data => {
      callback(null, formResponse({
        blog: data[0],
      }));
    }).catch(error => {
      callback(null, formResponse({ error }, 400));
    });
};

export const updateGhost = (event, context, callback) => {
  try {
    getAllGhostData().then(data => {
      const postsUpdated = batchUpdate(process.env.GHOST_TABLE, data.blog, 'id');

      Promise.all([postsUpdated]).then(() => {
        callback(null, formResponse({ success: true }));
      }).catch(error => {
        callback(null, formResponse({ error }, 400));
      });
    });
  } catch (error) {
    callback(null, formResponse({ error }, 400));
  }
};
