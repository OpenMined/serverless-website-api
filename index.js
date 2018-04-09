import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

import getAllGithubData from './github';
import initDynamoDb from './dynamo';

const app = express();
const dynamoDb = initDynamoDb();

app.use(cors());

app.get('/retrieve', (req, res) => {
  const params = {
    TableName: process.env.GITHUB_TABLE,
    Key: {
      dataId: 'github'
    }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log('ERROR', error);

      res.status(400).json({ error: 'Could not get data' });
    } else {
      if (result && result.Item) {
        res.json({ data: JSON.parse(result.Item.data) });
      } else {
        res.status(404).json({ error: 'Data not found' });
      }
    }
  });
});

export const retrieveGithub = serverless(app);

export const updateGithub = (event, context, callback) => {
  try {
    getAllGithubData().then(data => {
      const params = {
        TableName: process.env.GITHUB_TABLE,
        Item: {
          dataId: 'github',
          data: JSON.stringify(data)
        }
      };

      dynamoDb.put(params, error => {
        if (error) {
          callback({ error });
        } else {
          callback({ data });
        }
      });
    });
  } catch (error) {
    callback({ error });
  }
};
