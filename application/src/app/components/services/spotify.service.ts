import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  tracksUrl = 'http://localhost:8888/api/tracks';

  getTracksFromServer() {
    return this.http.get(this.tracksUrl);
  }

  getTracks(token, offset) {
    return this.http.get('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50&offset=' + offset, {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  getProfile(token) {
    return this.http.get("https://api.spotify.com/v1/me", {headers: { 'Authorization': 'Bearer ' + token }})
    .toPromise();
  }

  addEntry(obj) {
    this.http.post("https://whisperify.net/postuser", obj, {observe: 'response'}).subscribe(response => {
      // You can access status:
      //console.log(response.status);
      // Or any other header:
      //console.log(response.headers.get('X-Custom-Header'));
    });
    //console.log("sent");
  }

  addScore(score) {
    return this.http.post("https://whisperify.net/postscore", {score: score}, {observe: 'response'}).toPromise();
  }

  constructor(private http: HttpClient) { }
}
