const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const ClientError = require('./exceptions/ClientError');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongValidator = require('./validator/songs');
const users = require('./api/users');
const UsersService = require('./service/postgres/UsersService');
const UserValidator = require('./validator/users');


require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UsersService();

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
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError){
      console.log(response);
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
      return newResponse;
    }

    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      switch (statusCode) {
      case 401:
        return h.response(payload).code(401);
      case 404:
        return h.response(payload).code(404);
      default:
        console.log(response);
        return h.response({
          status: 'error',
          error: payload.error,
          message: payload.message,
        }).code(500);
      }
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);

};

init();