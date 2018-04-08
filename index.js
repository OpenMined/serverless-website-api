import serverless from 'serverless-http';
import express from 'express';
import AWS from 'aws-sdk';

import getAllGithubData from './github';

const app = express();
const GITHUB_TABLE = process.env.GITHUB_TABLE;

let dynamoDb;

if (process.env.IS_OFFLINE === true) {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

// Index route
app.get('/', (req, res) => {
  try {
    getAllGithubData().then(response => {
      res.send(response);
    });
  } catch (error) {
    console.log(error);

    res.status(404).json({ error });
  }
});

// Retrieve data endpoint
app.get('/retrieve', (req, res) => {
  const params = {
    TableName: GITHUB_TABLE,
    Key: {
      id: 'data'
    }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);

      res.status(400).json({ error: 'Could not get data' });
    }

    if (result.Item) {
      const { data } = result.Item;

      res.json({ data });
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  });
});

// Update data endpoint
app.post('/update', (req, res) => {
  try {
    getAllGithubData().then(data => {
      const params = {
        TableName: GITHUB_TABLE,
        Item: {
          id: 'data',
          data
        }
      };

      dynamoDb.put(params, error => {
        if (error) {
          console.log(error);

          res.status(400).json({ error: 'Could not save data' });
        }
        res.json(data);
      });
    });
  } catch (error) {
    console.log(error);

    res.status(404).json({ error });
  }
});

module.exports.handler = serverless(app);
