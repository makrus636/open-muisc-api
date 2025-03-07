const PlaylistSongsActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongsService',
  version: '1.0.0',
  register: async (server, { playlistSongsActivitiesService, playlistsService, validator }) => {
    const playlistSongsActivitiesHandler = new PlaylistSongsActivitiesHandler(
      playlistSongsActivitiesService,
      playlistsService,
      validator,
    );
    server.route(routes(playlistSongsActivitiesHandler));
  }
};