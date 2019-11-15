import { loadFromOffline, saveToOffline } from '../_helpers';

import getAllMembers from './members/';
import getAllRepositories from './repositories/';
import geocodeAllMembers from './geocode/';

export default async () => {
  const offlinePath = 'samples/github.json';
  const offlineData = loadFromOffline(offlinePath);

  if(offlineData) {
    console.log('Reading from file instead...');

    return offlineData;
  }

  const members = await getAllMembers();
  const repositories = await getAllRepositories();
  const finalMembers = await geocodeAllMembers(members);

  const response = {
    members: finalMembers,
    repositories
  };

  saveToOffline(offlinePath, response);

  return response;
};
