require('dotenv').config();
const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

const album = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const song = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
    const albumsService = new AlbumService();
    const songsService = new SongsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;
        if (response instanceof Error) {
     
          if (response instanceof ClientError) {
            const newResponse = h.response({
              status: 'fail',
              message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
          }
          if (!response.isServer) {
            return h.continue;
          }
          const newResponse = h.response({
            status: 'error',
            message: 'terjadi kegagalan pada server kami',
          });
          newResponse.code(500);
          return newResponse;
        }
        return h.continue;
    });

    await server.register({
        plugin: album,
        options: {
            service: albumsService,
            validator: AlbumsValidator,
        },
        plugin: song,
        options: {
            service: songsService,
            validator: SongsValidator,
        },
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();