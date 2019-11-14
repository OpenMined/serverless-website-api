import { flattenEdges, apolloFetch } from '../utils';
import { print } from 'graphql';

import query from './query.graphql';

export default async () => {
  const getMembers = (limit, cursor) =>
    apolloFetch({
      query: print(query),
      variables: { limit, cursor }
    }).catch(error => {
      throw new Error(error);
    });

  const limit = 100;
  const firstCall = await getMembers(limit);

  const { totalCount, edges } = firstCall.data.organization.membersWithRole;
  const numOfExtraRuns = Math.floor((totalCount - 1) / limit);

  let lastCursor = edges[edges.length - 1].cursor;
  let members = edges.map(flattenEdges);

  for (let i = 0; i < numOfExtraRuns; i++) {
    await getMembers(limit, lastCursor).then(({ data }) => {
      let newEdges = data.organization.membersWithRole.edges;

      members = [...members, ...newEdges.map(flattenEdges)];
      lastCursor = newEdges[newEdges.length - 1].cursor;
    });

    if (i === numOfExtraRuns - 1) {
      return members;
    }
  }
};
