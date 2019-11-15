import GhostContentAPI from '@tryghost/content-api'

import { loadFromOffline, saveToOffline } from '../_helpers';

export default async () => {
  const offlinePath = 'samples/ghost.json';
  const offlineData = loadFromOffline(offlinePath);

  if(offlineData) {
    console.log('Reading from file instead...');

    return offlineData;
  }

  const api = new GhostContentAPI({
    url: 'https://blog.openmined.org',
    key: process.env.OPENMINED_BLOG_TOKEN,
    version: "v3"
  });

  const getPosts = () =>
    api.posts
      .browse({ limit: 10, fields: 'id,title,slug,feature_image,custom_excerpt,url,published_at' })
      .then(posts => {
        delete posts.meta;

        return posts;
      })
      .catch((err) => {
        throw new Error(err);
      });

  const blog = await getPosts();

  const response = {
    blog
  };

  saveToOffline(offlinePath, response);

  return response;
};
