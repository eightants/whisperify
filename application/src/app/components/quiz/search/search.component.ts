import {
  Component,
  OnInit,
  Input,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SpotifyService],
})
export class SearchComponent implements OnInit {
  @Output() clickSubmit = new EventEmitter<string>();
  searchStr: string;
  @Input() tracks: any;
  searchRes: Array<any>;
  searchVal: string;
  focusDrop = false;
  selectedResult = false;
  hoverItem = -1;

  constructor() {}

  ngOnInit() {
    this.searchRes = this.tracks;
  }

  hoverElement(i: number) {
    this.hoverItem = i;
  }

  // these are functions to dynamically change the classes depending on the text in the search field
  expandedClass() {
    if (
      this.focusDrop == false ||
      this.searchRes == null ||
      this.searchRes.length < 1
    ) {
      return '';
    } else {
      return 'dropdown-expanded';
    }
  }

  unfocusDrop() {
    this.focusDrop = false;
    this.hoverItem = -1;
  }

  // unfocus the dropdown when somewhere else on the page is clicked
  @HostListener('document:click', ['$event'])
  documentClick() {
    this.unfocusDrop();
  }

  scrollToItem() {
    if (this.hoverItem != -1) {
      const itemToScrollTo = document.getElementById('item-' + this.hoverItem);
      if (itemToScrollTo) {
        itemToScrollTo.scrollIntoView(true);
      }
    }
  }

  handleKeyup(e: any) {
    if (this.focusDrop && this.searchRes.length > 0 && !this.selectedResult) {
      switch (e.key) {
        case 'ArrowUp':
          if (this.hoverItem != 0) {
            this.hoverElement(this.hoverItem - 1);
            this.scrollToItem();
          }
          break;
        case 'ArrowDown':
          if (this.hoverItem < this.searchRes.length - 1) {
            this.hoverElement(this.hoverItem + 1);
            this.scrollToItem();
          }
          break;
        case 'Enter':
          if (this.hoverItem != -1) {
            this.selectVal(
              this.searchRes[this.hoverItem].artists[0].name,
              this.searchRes[this.hoverItem].name
            );
            this.unfocusDrop();
          }
          break;
        default:
          this.searchMusic();
      }
      return;
    } else {
      switch (e.key) {
        case 'Enter':
          this.submitVal();
          break;
        default:
          this.searchMusic();
      }
    }
  }

  searchMusic() {
    this.selectedResult = false;
    // resets the array of tracks every keystroke
    if (this.searchStr == '' || this.searchStr == null) {
      this.searchRes = [];
      this.hoverItem = -1;
      return;
    } else {
      this.focusDrop = true;
      this.searchRes = this.tracks;
      this.searchVal = this.searchStr;
      // splits searchStr so keywords can be found individually, helpful for artist-song
      const keywords = this.searchStr.toLowerCase().split(' ');
      for (let i = 0; i < keywords.length; i++) {
        const tempArr = [];
        for (let j = 0; j < this.searchRes.length; j++) {
          // search song title for match with search term searchStr, also convert arr of artists into a string see if match too
          if (
            this.searchRes[j].name.toLowerCase().includes(keywords[i]) ||
            this.ArtistToStr(this.searchRes[j].artists)
              .toLowerCase()
              .includes(keywords[i])
          ) {
            // adds the formatted song - artist to be iterated through and displayed in dropdown in tempArr
            tempArr.push(this.searchRes[j]);
            //console.log(keywords[i], this.searchRes[j].name)
          }
        }
        this.searchRes = tempArr;
      }
    }
  }

  // converts arr of artists to string format
  ArtistToStr(artist) {
    let retStr = '';
    for (let i = 0; i < artist.length; i++) {
      retStr = retStr.concat(artist[i].name);
    }
    return retStr;
  }

  selectVal(artist, name) {
    this.searchVal = artist + ' - ' + name;
    this.selectedResult = true;
  }

  submitVal() {
    this.clickSubmit.next(this.searchVal); // passes searchVal as parameter
  }
}
