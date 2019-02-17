export default async () => {
  const params =
    'limit=10&fields=id,title,slug,feature_image,custom_excerpt,url,published_at';

  const getPosts = token =>
    fetch(
      'https://blog.openmined.org/ghost/api/v0.1/posts? ' +
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

  const blog = await getPosts(process.env.OPENMINED_BLOG_TOKEN);

  return {
    blog: blog.posts
  };
};
