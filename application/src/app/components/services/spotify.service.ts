import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  tracksUrl = 'http://localhost:8888/api/tracks';
  //mainUrl = "http://localhost:8888/";
  mainUrl = 'https://whisperify.net/';

  getTracksFromServer() {
    return this.http.get(this.tracksUrl);
  }

  getTracks(token, offset, term) {
    return this.http.get('https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50&offset=' + offset, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  getPlaylists(token, offset) {
    return this.http.get('https://api.spotify.com/v1/me/playlists?limit=50&offset=' + offset, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  getPlaylistTracks(pid, token, offset) {
    return this.http.get('https://api.spotify.com/v1/playlists/'+ pid + '/tracks?offset=' + offset, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  getProfile(token) {
    return this.http.get("https://api.spotify.com/v1/me", {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  createPlaylist(token, userid, name, desc) {
    return this.http.post("https://api.spotify.com/v1/users/" + userid + "/playlists", {"name": name, "public": true, "description": desc}, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  addPlaylistSongs(token, pid, songs) {
    return this.http.post("https://api.spotify.com/v1/playlists/" + pid + "/tracks", {"uris": songs}, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }


  addEntry(obj) {
    this.http.post(this.mainUrl + "postuser", obj, {observe: 'response'}).subscribe(response => {
      // You can access status:
      //console.log(response.status);
      // Or any other header:
      //console.log(response.headers.get('X-Custom-Header'));
    });
    //console.log("sent");
  }

  addScore(score) {
    return this.http.post(this.mainUrl + "postscore", {score: score}, {observe: 'response'}).toPromise();
  }

  addChallenge(obj) {
    return this.http.post(this.mainUrl + "postchallenge", obj, {observe: 'response', responseType: 'text'}).toPromise();
  }

  getChallenge(mycode) {
    return this.http.get(this.mainUrl + "getchallenge/" + mycode).toPromise();
  }

  addChallengeScore(code, score) {
    return this.http.post(this.mainUrl + "postchallengescore", {code: code, score: score}, {observe: 'response'}).toPromise();
  }

  cleanChallenges() {
    return this.http.get(this.mainUrl + "cleanchallenges").toPromise();
  }

  constructor(private http: HttpClient) { }
}
