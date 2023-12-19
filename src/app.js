require('dotenv').config();
const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

//albums
const album = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

//songs
const song = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumsService = new AlbumsService();
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

    await server.register([
      {
        plugin: album,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: song,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
    
    ]);

    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            // membuat response baru dari response toolkit sesuai kebutuhan error handling
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return response.continue || response;
    });

    

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();