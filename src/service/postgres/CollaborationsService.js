const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kollaborasi gagal ditambahkan');
    }

    await this._cacheService.delete(`collaborations:${userId}`);

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kollaborasi gagal dihapus');
    }

    await this._cacheService.delete(`collaborations:${userId}`);
  }

  async verifyCollaborator(playlistId, userId) {
    try {
      const cacheData = await this._cacheService.get(`collaborations:${userId}`);
      const collaborations = JSON.parse(cacheData);

      const isCollaboration = collaborations.some(
        (collab) => collab.playlist_id === playlistId
      );
      if (!isCollaboration) {
        throw new InvariantError('Kolaborasi gagal diverifikasi');
      }

      return;
    } catch {
      //
    }

    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kollaborasi gagal diverifikasi');
    }

    await this._cacheService.set(`collaborations:${userId}`, JSON.stringify(result.rows));
  }
}

module.exports = CollaborationsService;