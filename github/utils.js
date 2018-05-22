import { createApolloFetch } from 'apollo-fetch';

export const flattenEdges = member => member.node;
export const flattenAuthor = item => ({ ...item, author: item.author.login });
export const flattenComments = item => ({
  ...item,
  comments: item.comments.totalCount
});

export const apolloFetch = createApolloFetch({
  uri: 'https://api.github.com/graphql'
}).use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {};
  }

  options.headers['Authorization'] = 'bearer ' + process.env.GITHUB_TOKEN;

  next();
});
