class PlaylistSongsActivitiesHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.getPlaylistSongsActivitiesHandler = this.getPlaylistSongsActivitiesHandler.bind(this);
  }

  async getPlaylistSongsActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const data = {};
    const playlist = await this._playlistsService.getPlaylistById(credentialId, playlistId);
    data.playlistId = playlist.id;
    data.activities = await this._playlistsService.getPlaylistActivities(playlistId);

    const response = h.response({
      status: 'success',
      data,
    }).code(200);
    return response;
  }
}

module.exports = PlaylistSongsActivitiesHandler;