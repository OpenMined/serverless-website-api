import serverless from 'serverless-http';
import express from 'express';

import getAllGithubData from './github';
import initDynamoDb from './dynamo';

const app = express();
const dynamoDb = initDynamoDb();

// Retrieve data endpoint
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

// Update data endpoint
app.post('/update', (req, res) => {
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
          console.log('ERROR', error);

          res.status(400).json({ error: 'Could not save data' });
        } else {
          res.json({ data });
        }
      });
    });
  } catch (error) {
    console.log('ERROR', error);

    res.status(404).json({ error });
  }
});

module.exports.handler = serverless(app);
