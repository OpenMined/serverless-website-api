export default async members => {
  const runGeocode = request =>
    fetch(
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
        request +
        '.json?access_token=' +
        process.env.MAPBOX_TOKEN +
        '&limit=1'
    )
      .then(res => res.json())
      .catch(error => {
        throw new Error(error);
      });

  let geocodedMembers = [];

  for (let i = 0; i < members.length; i++) {
    let member = members[i];

    if (member.location) {
      await runGeocode(member.location).then(({ features }) => {
        if(features) {
          member.coords = features[0].center;
        }
      });
    }

    geocodedMembers.push(member);
  }

  return geocodedMembers;
};
