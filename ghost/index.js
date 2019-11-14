import GhostContentAPI from '@tryghost/content-api'

export default async () => {
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

  return {
    blog
  };
};
