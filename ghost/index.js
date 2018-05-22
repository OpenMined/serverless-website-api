export default async () => {
  const params =
    'limit=10&fields=id,title,slug,feature_image,custom_excerpt,url,published_at';

  const getPosts = (subdomain, token) =>
    fetch(
      'https://' +
        subdomain +
        '.ghost.io/ghost/api/v0.1/posts? ' +
        params +
        '&client_id=ghost-frontend&client_secret=' +
        token
    )
      .then(res => res.json())
      .then(res => {
        if (res.errors) {
          throw new Error(res.error);
        }

        return res;
      })
      .catch(error => {
        throw new Error(error);
      });

  const blog = await getPosts(
    'openmined-blog',
    process.env.OPENMINED_BLOG_TOKEN
  );
  const digs = await getPosts('weekly-digs', process.env.WEEKLY_DIGS_TOKEN);

  return {
    blog: blog.posts,
    digs: digs.posts
  };
};
