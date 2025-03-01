const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationsResult = AlbumPayloadSchema.validate(payload);
    if (validationsResult.error) {
      throw new InvariantError(validationsResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;