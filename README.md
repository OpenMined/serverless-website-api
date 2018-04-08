# Serverless Github data
[Our website](https://www.openmined.org) needs to gather some information from Github to display on screen. Unfortunately, due to rate limiting it doesn't make sense to always ask Github for this information. It's far quicker for us to cache this information elsewhere and retrieve it from there instead.

This code features two routes: `/update` and `/retrieve`. The former is run by a cron job on AWS Lambda to get the latest Github repository and user statistical data for the OpenMined community. It then proceeds to cache this information in a DynamoDB table. The latter is purely a route we can hit to receive this information, pulling from DynamoDB instead of from Github.

## Installation
1. Copy `env.sample.yml` to `env.yml` and supply proper Github keys
2. Install all dependencies: `yarn install`
3. Install DynamoDB locally: `sls dynamodb install`
4. Run locally: `yarn start`
