const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const ClientError = require('./exceptions/ClientError');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongValidator = require('./validator/songs');


require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();

  const server = Hapi.Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumsValidator
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if(response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);

};

init();