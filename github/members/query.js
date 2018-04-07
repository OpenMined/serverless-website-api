import gql from 'graphql-tag';

export default gql`
  query getMembers($limit: Int!, $cursor: String) {
    organization(login: "openmined") {
      members(first: $limit, after: $cursor) {
        totalCount
        edges {
          cursor
          node {
            name
            login
            avatarUrl
            location
          }
        }
      }
    }
  }
`;
