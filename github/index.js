import getAllMembers from './members/';
import getAllRepositories from './repositories/';
import geocodeAllMembers from './geocode/';

export default async () => {
  const members = await getAllMembers();
  const repositories = await getAllRepositories();
  const finalMembers = await geocodeAllMembers(members);

  return {
    members: finalMembers,
    repositories
  };
};
