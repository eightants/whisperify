import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'], 
  providers:[SpotifyService], 
})
export class SearchComponent implements OnInit {
  @Output() clickSubmit = new EventEmitter<string>();
  searchStr:string;
  @Input() tracks: any;
  searchRes = this.tracks;
  searchVal:string;
  focusDrop = false;


  constructor(private _spotifyService:SpotifyService) {}

  ngOnInit() {
  }

  // these are functions to dynamically change the classes depending on the text in the search field
  expandedClass() {
    if (this.focusDrop == false || this.searchRes == null || this.searchRes.length < 1) {
      return "";
    } else {
      return "dropdown-expanded";
    }
  }

  unfocusDrop() {
    this.focusDrop = false;
  }

  // unfocus the dropdown when somewhere else on the page is clicked
  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    this.unfocusDrop();
  }

  searchMusic() {
    // resets the array of tracks every keystroke
    if (this.searchStr == "" || this.searchStr == null) {
      this.searchRes = null;
      return [];
    } else {
      this.focusDrop = true;
      this.searchRes = this.tracks;
      this.searchVal = this.searchStr;
      // console.log(this.searchStr)
      // splits searchStr so keywords can be found individually, helpful for artist-song
      let keywords = this.searchStr.toLowerCase().split(' ');
      for (let i = 0; i < keywords.length; i++) {
        let tempArr = []
        for (let j = 0; j < this.searchRes.length; j++) {
          // search song title for match with search term searchStr, also convert arr of artists into a string see if match too
          if (this.searchRes[j].name.toLowerCase().includes(keywords[i]) || this.ArtistToStr(this.searchRes[j].artists).toLowerCase().includes(keywords[i])) {
            // adds the formatted song - artist to be iterated through and displayed in dropdown in tempArr
            tempArr.push(this.searchRes[j]);
            //console.log(keywords[i], this.searchRes[j].name)
          }
        }
        this.searchRes = tempArr;
      }
      //return this.searchRes;
    }
  }

  // converts arr of artists to string format
  ArtistToStr(artist) {
    let retStr = "";
    for (let i = 0; i < artist.length; i++) {
      retStr = retStr.concat(artist[i].name);
    }
    return retStr;
  }

  selectVal(artist, name) {
    //console.log("selected");
    this.searchVal = artist + " - " + name;
  }

  submitVal() {
    this.clickSubmit.next(this.searchVal); // passes searchVal as parameter
  }

}
