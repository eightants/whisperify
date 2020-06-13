import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// this service stores variable tokenSource across all views, so it is accessible and changable everywhere
// I decided to use sessionStorage instead of this, but saving it here in case of another use case

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  private tokenSource = new BehaviorSubject('no_token');
  private quizConfig = new BehaviorSubject('default');
  private quizSongs = new BehaviorSubject('default');
  private quizSongList = new BehaviorSubject('default');
  private quizIndexes = new BehaviorSubject('default');
  currentToken = this.tokenSource.asObservable();
  currentConfig = this.quizConfig.asObservable();
  currentSongs = this.quizSongs.asObservable();
  currentSongList = this.quizSongList.asObservable();
  currentIndexes = this.quizIndexes.asObservable();

  constructor() { }

  changeToken(token: string) {
    this.tokenSource.next(token);
  }

  changeConfigs(config: any) {
    this.quizConfig.next(config);
  }

  changeSongs(songs: any) {
    this.quizSongs.next(songs);
  }

  changeSongList(songs: any) {
    this.quizSongList.next(songs);
  }

  changeIndexes(ind: any) {
    this.quizIndexes.next(ind);
  }
}
