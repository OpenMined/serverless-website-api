import {
  flattenEdges,
  flattenAuthor,
  flattenComments,
  apolloFetch
} from '../utils';
import { print } from 'graphql';

import query from './query.graphql';

const cleanRepository = repository => {
  repository.shortName = repository.resourcePath.split('/OpenMined/')[1];
  repository.language = repository.primaryLanguage
    ? repository.primaryLanguage.name
    : null;
  repository.starCount = repository.stargazers.totalCount;

  delete repository.resourcePath;
  delete repository.primaryLanguage;
  delete repository.stargazers;

  repository.recentIssues = repository.recentIssues.edges
    .map(flattenEdges)
    .map(flattenAuthor)
    .map(flattenComments);

  repository.topIssues = repository.topIssues.edges
    .map(flattenEdges)
    .map(flattenAuthor)
    .map(flattenComments);

  return repository;
};

export default async () =>
  await apolloFetch({
    query: print(query)
  })
    .then(response => {
      return response.data.organization.repositories.edges
        .map(flattenEdges)
        .map(cleanRepository);
    })
    .catch(error => {
      throw new Error(error);
    });
