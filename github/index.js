import getAllMembers from './members/';
import getAllRepositories from './repositories/';

export default async () => {
  const members = await getAllMembers();
  const repositories = await getAllRepositories();

  return {
    members,
    repositories
  };
};
