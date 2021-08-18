import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAINURL } from '../../globals';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  mainUrl = MAINURL;

  getTracks(token, offset, term) {
    return this.http
      .get(
        'https://api.spotify.com/v1/me/top/tracks?time_range=' +
          term +
          '&limit=50&offset=' +
          offset,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getArtists(token, offset, term) {
    return this.http
      .get(
        'https://api.spotify.com/v1/me/top/artists?time_range=' +
          term +
          '&limit=50&offset=' +
          offset,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getPlaylists(token, offset) {
    return this.http
      .get(
        'https://api.spotify.com/v1/me/playlists?limit=50&offset=' + offset,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getPlaylistTracks(pid, token, offset) {
    return this.http
      .get(
        'https://api.spotify.com/v1/playlists/' +
          pid +
          '/tracks?offset=' +
          offset,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getSavedSongs(token, offset, limit = 50) {
    return this.http
      .get(
        `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getProfile(token) {
    return this.http
      .get('https://api.spotify.com/v1/me', {
        headers: { Authorization: 'Bearer ' + token },
      })
      .toPromise();
  }

  createPlaylist(token, userid, name, desc) {
    return this.http
      .post(
        'https://api.spotify.com/v1/users/' + userid + '/playlists',
        { name: name, public: true, description: desc },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  addPlaylistSongs(token, pid, songs) {
    return this.http
      .post(
        'https://api.spotify.com/v1/playlists/' + pid + '/tracks',
        { uris: songs },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  getUserAudioFeatures(token, songs) {
    return this.http
      .get(
        'https://api.spotify.com/v1/audio-features/?ids=' + songs.toString(),
        { headers: { Authorization: 'Bearer ' + token } }
      )
      .toPromise();
  }

  addUserAnalysis(obj) {
    return this.http
      .post(this.mainUrl + 'api/postanalysis', obj, { observe: 'response' })
      .toPromise();
  }

  addEntry(obj) {
    this.http
      .post(this.mainUrl + 'api/postuser', obj, { observe: 'response' })
      .subscribe(() => {
        // You can access status:
        // console.log(response.status);
        // Or any other header:
        //console.log(response.headers.get('X-Custom-Header'));
      });
    //console.log("sent");
  }

  addScore(obj) {
    this.http
      .post(this.mainUrl + 'api/postscore', obj, { observe: 'response' })
      .subscribe();
  }

  getPercent(score) {
    return this.http
      .post(
        this.mainUrl + 'api/postpercent',
        { score: score },
        { observe: 'response' }
      )
      .toPromise();
  }

  addChallenge(obj) {
    return this.http
      .post(this.mainUrl + 'postchallenge', obj, {
        observe: 'response',
        responseType: 'text',
      })
      .toPromise();
  }

  getChallenge(mycode: string) {
    return this.http.get(this.mainUrl + 'getchallenge/' + mycode).toPromise();
  }

  getChallengesByUser(user: string) {
    return this.http
      .get(this.mainUrl + 'getchallenge/user/' + user)
      .toPromise();
  }

  addChallengeScore(code, score) {
    return this.http
      .post(
        this.mainUrl + 'postchallengescore',
        { code: code, score: score },
        { observe: 'response' }
      )
      .toPromise();
  }

  deleteChallenge(code) {
    return this.http
      .post(this.mainUrl + 'deletechallenge', { code: code })
      .toPromise();
  }

  cleanChallenges() {
    return this.http.get(this.mainUrl + 'cleanchallenges').toPromise();
  }

  getUserAnalysis(username) {
    return this.http.get(this.mainUrl + 'api/user/' + username).toPromise();
  }

  getGroupAnalysis(category) {
    return this.http
      .get(this.mainUrl + 'api/features/group/' + category)
      .toPromise();
  }

  getAlbumAnalysisGuest(id) {
    return this.http
      .get(this.mainUrl + 'api/getalbumfeatures/' + id)
      .toPromise();
  }

  getAlbumAnalysis(id, token) {
    return this.http
      .get(this.mainUrl + 'api/features/album/' + id + '/' + token)
      .toPromise();
  }

  getPlaylistAnalysis(id, token) {
    return this.http
      .get(this.mainUrl + 'api/features/playlist/' + id + '/' + token)
      .toPromise();
  }

  getLeaderboard(sort: string) {
    return this.http.get(this.mainUrl + `leaderboard/${sort}`).toPromise();
  }

  getUserProfile(user: string) {
    return this.http.get(this.mainUrl + `api/profile/${user}`).toPromise();
  }

  constructor(private http: HttpClient) {}
}
