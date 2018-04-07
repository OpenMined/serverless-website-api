import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import express from 'express';
import AWS from 'aws-sdk';

import getAllGithubData from './github';

const app = express();

const GITHUB_TABLE = process.env.GITHUB_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;

if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(bodyParser.json({ strict: false }));

// Index route
app.get('/', (req, res) => {
  try {
    getAllGithubData().then(response => {
      res.send(response);
    });
  } catch (e) {
    console.error(e);
  }
});

// Get Github endpoint
app.get('/github/:githubId', (req, res) => {
  const params = {
    TableName: GITHUB_TABLE,
    Key: {
      githubId: req.params.githubId
    }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get github' });
    }

    if (result.Item) {
      const { githubId, name } = result.Item;
      res.json({ githubId, name });
    } else {
      res.status(404).json({ error: 'Github not found' });
    }
  });
});

// Create Github endpoint
app.post('/github', (req, res) => {
  const { githubId, name } = req.body;

  if (typeof githubId !== 'string') {
    res.status(400).json({ error: '"githubId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: GITHUB_TABLE,
    Item: {
      githubId: githubId,
      name: name
    }
  };

  dynamoDb.put(params, error => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create github' });
    }
    res.json({ githubId, name });
  });
});

module.exports.handler = serverless(app);
