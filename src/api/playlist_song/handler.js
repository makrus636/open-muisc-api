class PlaylistSongsHandler {
  constructor(playlistSongsService, validator, playlistService, songsService) {
    this._playlistSongsService = playlistSongsService;
    this._validator = validator;
    this._playlistService = playlistService;
    this._songsService = songsService;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._songsService.getSongById(songId);
    await this._playlistSongsService.addSongPlaylist({ playlistId: id, songId });

    const time = new Date().toISOString();
    await this._playlistSongsService.addActivity({
      playlistId: id,
      songId,
      credentialId,
      action: 'add',
      time,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditmbahkan keplaylist'
    }).code(201);

    return response;
  }

  async getPlaylistSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistSongsService.getSongPlaylist(playlistId);
    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    }).code(200);

    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deleteSongPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    }).code(200);
    return response;
  }
}

module.exports = PlaylistSongsHandler;