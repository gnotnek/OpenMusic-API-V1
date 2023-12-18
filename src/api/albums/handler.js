const ClientError = require('../../exceptions/ClientError');
const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(service) {
        this._service = service;
        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });

        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);
        return {
            status: 'success',
            data: {
                album,
            },
        };

        response.code(201);
    }

    async putAlbumByIdHandler(request, h) {
        const { id } = request.params;

        await this._service.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }
}

module.exports = AlbumsHandler;
