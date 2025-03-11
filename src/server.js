const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');
const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const songs = require('./api/songs');
const SongsService = require('./service/postgres/SongService');
const SongValidator = require('./validator/songs');
const users = require('./api/users');
const UsersService = require('./service/postgres/UsersService');
const UserValidator = require('./validator/users');
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const playlist = require('./api/playlist');
const PlaylistsService = require('./service/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlist');
const playlistSong = require('./api/playlist_song');
const PlaylistSongsService = require('./service/postgres/PlaylistSongService');
const PlaylistSongValidator = require('./validator/playlist_songs');
const playlistSongsActivities = require('./api/playlist_songs_activities');
const PlaylistSongsActivitiesService = require('./service/postgres/PlaylistSongActivitiesService');
const PlaylistSongActivitiesValidator = require('./validator/playlist_song_activities');
const collaborations = require('./api/collaborations');
const CollaborationService = require('./service/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./service/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const CacheService = require('./service/redis/CacheService');

require('dotenv').config();

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationService(cacheService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongsActivitiesService = new PlaylistSongsActivitiesService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/pictures'),
  );

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
      plugin: Jwt,
    },
    {
      plugin: Inert,
    }
  ]);

  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
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
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSong,
      options: {
        playlistsService,
        songsService,
        playlistSongsService,
        collaborationsService,
        validator: PlaylistSongValidator,
      },
    },
    {
      plugin: playlistSongsActivities,
      options: {
        playlistSongsActivitiesService,
        playlistsService,
        validator: PlaylistSongActivitiesValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        albumsService,
        validator: UploadsValidator,
      }
    }
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError){
      console.log(response);
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      switch (statusCode) {
      case 401:
        return h.response(payload).code(401);
      case 404:
        return h.response(payload).code(404);
      case 413:
        return h.response({
          status: 'fail',
          message: 'Ukuran file terlalu besar',
        }).code(413);
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