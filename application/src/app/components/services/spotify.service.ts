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

  constructor(private http: HttpClient) { }
}
