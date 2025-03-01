const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongService {
  constructor() {
    this._songs = [];
  }

  addSong({ title, year, performer, genre, duration, albumId }){
    const id = `song-${nanoid(16)}`;
    const newSong = { id, title, year, performer, genre, duration, albumId };
    this._songs.push(newSong);

    const isSucces = this._songs.some((song) => song.id === id);
    if (!isSucces){
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return id;
  }

  getSongs({ title, performer }){
    let songs = this._songs;

    if (title) {
      const lowercasedTitle = title.toLowerCase();
      songs = songs.filter((songs) => songs.title.toLowerCase().includes(lowercasedTitle));
    }

    if (performer) {
      const lowercasedPerformer = performer.toLowerCase();
      songs = songs.filter((songs) => songs.performer.toLowerCase().includes(lowercasedPerformer));
    }

    return songs.map(({ id, title, performer }) => ({
      id, title, performer,
    }));
  }

  getSongByAlbumId(albumId){
    return this._songs.filter((songs) => songs.albumId === albumId).map(({
      id,
      title,
      performer
    }) => ({
      id,
      title,
      performer,
    }));
  }

  getSongById(id){
    const songs = this._songs.find((songs) => songs.id === id);
    if (!songs){
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return songs;
  }

  editSongById(id, { title, year, performer, genre, duration, albumId }){
    const index = this._songs.findIndex((song) => song.id === id);

    if (index === -1){
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    this._songs[index] = { ...this._songs[index], title, year, genre, performer, duration, albumId };

  }

  deleteSongById(id){
    const index = this._songs.findIndex((song) => song.id === id);
    if (index === -1){
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = SongService;