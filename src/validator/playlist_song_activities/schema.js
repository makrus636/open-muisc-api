const Joi = require('joi');

const PlaylistSongActivitiesPlayloadSchema = Joi.object({
  PlaylistId: Joi.string().required(),
});

module.exports = { PlaylistSongActivitiesPlayloadSchema };