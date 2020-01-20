import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// this service stores variable tokenSource across all views, so it is accessible and changable everywhere
// I decided to use sessionStorage instead of this, but saving it here in case of another use case

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  private tokenSource = new BehaviorSubject('no_token');
  currentToken = this.tokenSource.asObservable();

  constructor() { }

  changeToken(token: string) {
    this.tokenSource.next(token);
  }
}
