import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { DatastoreService } from '../services/datastore.service';
import { allFeaturesToAdd, getRandomInt } from '../../globals';
import { TitleTagService } from '../services/title-tag.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeComponent implements OnInit {
  constructor(
    private router: Router,
    private spotify: SpotifyService,
    private data: DatastoreService,
    private titleTagService: TitleTagService
  ) {}
  token = '';
  username = '';
  displayName = '';
  answered = 'no';
  isLoaded = false;
  playlists = [];
  playlistsLoaded = false;
  playlistList = [];
  searchPlayStr = '';
  options = false;
  // these variables are the configs of the quiz
  whisperLen = [2, 5, 10];
  timeLimit = [20, 40];
  timePeriod = ['4 weeks', '6 months', 'Lifetime'];
  chosenPeriod = '6 months';
  modeChoice = 'top';
  config = {};
  artists = new Map();
  artistList = [];
  tracks = [];
  excludeModule = false;
  searchStr = '';
  searchVal: string;
  searchList = [];
  off = [0];
  pid = 0;
  psize = 0;
  savedSongsSize = 0;
  prevExclude = [];
  totsongs = 100;
  timePeriodMap = {
    '4 weeks': 'short_term',
    '6 months': 'medium_term',
    Lifetime: 'long_term',
  };
  isSingleplayer = false;
  isMultiplayer = false;
  hasFollowed = false;

  ngOnInit(): void {
    this.titleTagService.setTitle('Menu - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Menu - Whisperify',
      'Choose an option. Quiz yourself on your favourite songs, playlists, share quizzes with friends, or view your music stats. '
    );
    this.token = sessionStorage.getItem('token');
    this.username = sessionStorage.getItem('username') || '';
    sessionStorage.setItem('challenge', '');
    sessionStorage.setItem('currentLink', '');
    this.modeChoice = 'top';
    this.totsongs = 100;
    this.excludeModule = false;
    this.config = {
      whisperLen: 5,
      timeLimit: 20,
      excludeArtists: [],
      multChoice: false,
      choice: 'top',
    };
    const redirect = sessionStorage.getItem('redirect');
    if (redirect == 'analysis') {
      this.router.navigate(['/analysis']);
    }
    if (this.token != '' && this.token != null) {
      this.getSongsAndPostToDB();
    } else {
      this.router.navigate(['/']);
    }
  }

  getSongsAndPostToDB(): void {
    // checks that token is present and we haven't already sent this user to DB
    if (this.token != '' && this.token != null && this.username != 'd') {
      this.spotify
        .getTracks(this.token, '0', 'medium_term')
        .then((res) => {
          this.spotify
            .getTracks(this.token, '49', 'medium_term')
            .then((res2) => {
              this.tracks = res['items'].concat(res2['items']);
              this.spotify.getProfile(this.token).then((useres) => {
                this.username = useres['id'];
                this.displayName = useres['display_name'];
                sessionStorage.setItem('displayname', this.displayName);
                sessionStorage.setItem('username', this.username);
                const songList = this.tracks.map(({ id }) => id);
                // get audio features for this user
                this.spotify
                  .getUserAudioFeatures(this.token, songList)
                  .then((feat) => {
                    const averageFeatures = feat['audio_features'][0] || {};
                    //console.log(averageFeatures);
                    for (let i = 1; i < feat['audio_features'].length; i++) {
                      for (let j = 0; j < allFeaturesToAdd.length; j++) {
                        averageFeatures[allFeaturesToAdd[j]] +=
                          feat['audio_features'][i][allFeaturesToAdd[j]];
                      }
                    }
                    for (let j = 0; j < allFeaturesToAdd.length; j++) {
                      averageFeatures[allFeaturesToAdd[j]] /=
                        feat['audio_features'].length;
                    }
                    const cleanedFeatures = {};
                    for (let j = 0; j < allFeaturesToAdd.length; j++) {
                      cleanedFeatures[allFeaturesToAdd[j]] =
                        averageFeatures[allFeaturesToAdd[j]];
                    }
                    this.spotify.addEntry({
                      _id: useres['id'],
                      email: useres['email'],
                      name: useres['display_name'],
                      time: Date.now(),
                      tracks: songList,
                      country: useres['country'],
                      ...cleanedFeatures,
                    });
                  });
                // checks if they have already answered the survey
                this.spotify.getUserAnalysis(this.username).then((res) => {
                  if (res != null) {
                    if (res['ei']) {
                      this.answered = 'yes';
                    }
                    if (res['followedTwitter']) {
                      this.hasFollowed = true;
                    }
                  }
                  sessionStorage.setItem('answered', this.answered);
                });
              });
            });
        })
        .catch((e) => {
          console.log(e);
          this.router.navigate(['/']);
        });
    } else {
      // checks if they have already answered the survey
      this.spotify.getUserAnalysis(this.username).then((res) => {
        if (res != null) {
          if (res['ei']) {
            this.answered = 'yes';
          }
          if (res['followedTwitter']) {
            this.hasFollowed = true;
          }
        }
        sessionStorage.setItem('answered', this.answered);
      });
    }
  }

  chooseTop(): void {
    this.options = true;
  }

  choosePeriod(val: string): void {
    this.chosenPeriod = val;
    this.artists = new Map();
    this.artistList = [];
    this.config['excludeArtists'] = [];
  }

  choosePlaylist(count: number): void {
    this.isLoaded = true;
    if (this.playlistsLoaded == true) {
      return;
    }
    // get playlists
    this.spotify
      .getPlaylists(this.token, count.toString())
      .then((res) => {
        for (let i = 0; i < res['items'].length; i++) {
          if (res['items'][i].tracks.total >= 20) {
            this.playlists.push(res['items'][i]);
          }
        }
        if (count + 50 < res['total']) {
          // recursive until all playlists obtained
          this.choosePlaylist(count + 50);
        } else {
          this.searchPlaylists();
          this.spotify.getSavedSongs(this.token, 0, 1).then((res) => {
            this.savedSongsSize = res['total'];
            this.playlistsLoaded = true;
          });
        }
      })
      .catch((e) => {
        console.log(e);
        this.router.navigate(['/']);
      });
  }

  searchPlaylists(): void {
    // resets the array of tracks every keystroke
    if (this.searchPlayStr == '' || this.searchPlayStr == null) {
      this.playlistList = this.playlists;
    } else {
      this.playlistList = this.playlists;
      const keywords = this.searchPlayStr.toLowerCase().split(' ');
      for (let i = 0; i < keywords.length; i++) {
        const tempArr = [];
        for (let j = 0; j < this.playlistList.length; j++) {
          if (
            this.playlistList[j]['name'].toLowerCase().includes(keywords[i])
          ) {
            tempArr.push(this.playlistList[j]);
          }
        }
        this.playlistList = tempArr;
      }
    }
  }

  selectPlaylist(p): void {
    this.pid = p.id;
    this.psize = p.tracks.total;
    this.totsongs = this.psize;
    this.config['pid'] = this.pid;
    this.config['psize'] = this.psize;
    this.config['choice'] = 'playlist';
    const TRACKS_PER_REQUEST_PLAYLIST = 100;
    this.off = this.createOffsets(p.tracks.total, TRACKS_PER_REQUEST_PLAYLIST);
    this.config['offset'] = this.off;
    this.modeChoice = 'playlist';
    this.unLoad();
    this.options = true;
  }

  selectSavedSongs(): void {
    this.totsongs = this.savedSongsSize;
    this.config['psize'] = this.savedSongsSize;
    this.config['choice'] = 'saved';
    const TRACKS_PER_REQUEST_SAVED_SONGS = 50;
    this.off = this.createOffsets(
      this.savedSongsSize,
      TRACKS_PER_REQUEST_SAVED_SONGS
    );
    this.config['offset'] = this.off;
    this.modeChoice = 'saved';
    this.unLoad();
    this.options = true;
  }

  toggleOptions(): void {
    this.options = false;
    this.artistList = [];
    this.config['excludeArtists'] = [];
  }

  togglePlay(): void {
    this.isSingleplayer = false;
    this.isMultiplayer = false;
  }

  followTwitter(): void {
    setTimeout(() => {
      this.hasFollowed = true;
      this.spotify.addEntry({
        _id: this.username,
        followedTwitter: this.hasFollowed,
      });
    }, 8000);
  }

  startQuiz(): void {
    if (this.modeChoice == 'top') {
      this.config['timePeriod'] = this.chosenPeriod;
    }
    //console.log(this.totsongs);
    if (this.totsongs < 30) {
      //console.log("not enough")
      this.router.navigate(['/no-info']);
    } else {
      this.data.changeConfigs(this.config);
      this.router.navigate(['/quiz']);
    }
  }

  unLoad(): void {
    this.isLoaded = false;
    this.excludeModule = false;
  }

  unLoadExclude(): void {
    this.excludeModule = false;
    this.searchList = this.artistList;
    this.searchStr = '';
    this.config['excludeArtists'] = this.prevExclude.slice();
  }

  toExclude(): void {
    this.loadArtists();
    this.excludeModule = true;
  }

  loadArtists(): void {
    if (this.token == '' || this.token == null) {
      this.router.navigate(['/']);
    }
    // ES6 passes by reference in arrays, so need slice
    this.prevExclude = this.config['excludeArtists'].slice();
    // get playlist or top tracks depending on the selection
    if (this.artistList.length <= 0) {
      if (this.modeChoice == 'top') {
        if (
          this.timePeriodMap[this.chosenPeriod] == 'medium_term' &&
          this.tracks.length > 0
        ) {
          const trackprev = this.tracks;
          this.totsongs = trackprev.length;
          // since we're just trying to get the artists in the top songs, we just loop and count the artists
          for (let i = 0; i < trackprev.length; i++) {
            if (this.artists.has(trackprev[i].artists[0].name)) {
              this.artists.get(trackprev[i].artists[0].name).val++;
            } else {
              this.artists.set(trackprev[i].artists[0].name, {
                val: 1,
                id: trackprev[i].artists[0].id,
              });
            }
          }
          this.artistList = Array.from(this.artists.keys()).sort();
          this.searchArtists();
        } else {
          // get request
          this.spotify
            .getTracks(this.token, '0', this.timePeriodMap[this.chosenPeriod])
            .then((res) => {
              this.spotify
                .getTracks(
                  this.token,
                  '49',
                  this.timePeriodMap[this.chosenPeriod]
                )
                .then((res2) => {
                  const trackprev = res['items'].concat(res2['items']);
                  this.totsongs = trackprev.length;
                  // since we're just trying to get the artists in the top songs, we just loop and count the artists
                  for (let i = 0; i < trackprev.length; i++) {
                    if (this.artists.has(trackprev[i].artists[0].name)) {
                      this.artists.get(trackprev[i].artists[0].name).val++;
                    } else {
                      this.artists.set(trackprev[i].artists[0].name, {
                        val: 1,
                        id: trackprev[i].artists[0].id,
                      });
                    }
                  }
                  this.artistList = Array.from(this.artists.keys()).sort();
                  this.searchArtists();
                });
            })
            .catch((e) => {
              console.log(e);
              this.router.navigate(['/']);
            });
        }
      } else if (this.modeChoice === 'saved') {
        const allOffsets = [];
        for (const off of this.off) {
          allOffsets.push(
            this.spotify.getSavedSongs(this.token, off.toString())
          );
        }
        const getAllSongSamples = Promise.all(allOffsets);

        getAllSongSamples
          .then((values) => {
            const trackprev = [];
            for (const res of values) {
              trackprev.push(...res['items']);
            }
            this.totsongs = trackprev.length;
            for (let i = 0; i < trackprev.length; i++) {
              if (this.artists.has(trackprev[i].track.artists[0].name)) {
                this.artists.get(trackprev[i].track.artists[0].name).val++;
              } else {
                this.artists.set(trackprev[i].track.artists[0].name, {
                  val: 1,
                  id: trackprev[i].track.artists[0].id,
                });
              }
            }
            this.artistList = Array.from(this.artists.keys()).sort();
            this.searchArtists();
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(['/']);
          });
      } else {
        const allOffsets = [];
        for (const off of this.off) {
          allOffsets.push(
            this.spotify.getPlaylistTracks(this.pid, this.token, off.toString())
          );
        }
        const getAllSongSamples = Promise.all(allOffsets);

        getAllSongSamples
          .then((values) => {
            const trackprev = [];
            for (const res of values) {
              trackprev.push(...res['items']);
            }
            this.totsongs = trackprev.length;
            for (let i = 0; i < trackprev.length; i++) {
              if (this.artists.has(trackprev[i].track.artists[0].name)) {
                this.artists.get(trackprev[i].track.artists[0].name).val++;
              } else {
                this.artists.set(trackprev[i].track.artists[0].name, {
                  val: 1,
                  id: trackprev[i].track.artists[0].id,
                });
              }
            }
            this.artistList = Array.from(this.artists.keys()).sort();
            this.searchArtists();
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(['/']);
          });
      }
    } else {
      this.searchArtists();
    }
  }

  searchArtists() {
    // resets the array of tracks every keystroke
    if (this.searchStr == '' || this.searchStr == null) {
      this.searchList = this.artistList;
    } else {
      this.searchList = this.artistList;
      this.searchVal = this.searchStr;
      const keywords = this.searchStr.toLowerCase().split(' ');
      for (let i = 0; i < keywords.length; i++) {
        const tempArr = [];
        for (let j = 0; j < this.searchList.length; j++) {
          // search song title for match with search term searchStr, also convert arr of artists into a string see if match too
          if (this.searchList[j].toLowerCase().includes(keywords[i])) {
            // adds the formatted song - artist to be iterated through and displayed in dropdown in tempArr
            tempArr.push(this.searchList[j]);
            //console.log(keywords[i], this.searchRes[j].name)
          }
        }
        this.searchList = tempArr;
      }
    }
  }

  addArtist(name) {
    this.config['excludeArtists'].push(name);
    this.totsongs -= this.artists.get(name).val;
    this.searchVal = '';
    this.searchStr = '';
    //console.log(this.totsongs);
  }

  removeArtist(name) {
    const index = this.config['excludeArtists'].indexOf(name);
    if (index > -1) {
      this.config['excludeArtists'].splice(index, 1);
      this.totsongs += this.artists.get(name).val;
    }
  }

  toAnalysis() {
    if (this.answered == 'yes') {
      this.router.navigate(['/analysis']);
    } else if (this.token != null && this.token != '') {
      this.router.navigate(['/survey']);
    } else {
      this.router.navigate(['/analysis']);
    }
  }

  createOffsets(totalTrackCount, tracksPerRequest) {
    // increase this number for better autocompletion
    const MAX_API_CALLS = 4;

    if (totalTrackCount > MAX_API_CALLS * tracksPerRequest) {
      return this.createNonOverlappingIntervals(
        MAX_API_CALLS,
        tracksPerRequest,
        totalTrackCount
      );
    } else {
      const off = [];
      for (let i = 0; i < totalTrackCount; i += tracksPerRequest) {
        off.push(i);
      }
      return off;
    }
  }

  /**
   * Create `count` intervals of size `intervalSize` which are all subsets of the interval `[0, totalsize[`.
   *
   * Returns the starting value of each resulting interval.
   *
   * Example: Let count = 3 and intervalSize = 100 and totalSize = 1000.
   * If the algorithm chooses the three intervals [7, 106], [333, 432] and [900, 999]
   * then the array [7, 333, 900] is returned.
   */
  createNonOverlappingIntervals(count, intervalSize, totalSize) {
    const totalIntervalSize = intervalSize * count;
    let totalSpaceBetweenIntervals = totalSize - totalIntervalSize;

    if (totalSpaceBetweenIntervals < 0) {
      totalSpaceBetweenIntervals = 0;
    }

    // the space between intervals
    // Example: If spaceBetweenIntervals is [12, 34, 56] and size is 10, then the result will be [12, 21] | [56, 65]
    const spaceBetweenIntervals = this.getRandomNumbersWithFixedSum(
      count + 1,
      totalSpaceBetweenIntervals
    );

    const result = [];
    let index = 0;
    for (let i = 0; i < count; i++) {
      index += spaceBetweenIntervals[i];
      result.push(index);
      index += intervalSize;
    }
    return result;
  }

  getRandomNumbersWithFixedSum(count, expectedSum) {
    // Step 1: Create an array of `count` random floating point values
    let randomFloats = Array.from({ length: count }, () => Math.random());

    // Step 2: Calculate sum of those values
    let randomTotal = randomFloats.reduce((partialSum, a) => partialSum + a, 0);

    // Step 3: Scale the values so that they sum to `expectedSum` instead of `randomTotal`
    // while handling the practically impossible case that all calls to Math.random returned exactly 0
    if (randomTotal == 0) {
      // all values are equal, so they all get the same value
      randomFloats = Array.from({ length: count }, () => 1);
      randomTotal = randomFloats.reduce((partialSum, a) => partialSum + a, 0);
    }
    const factor = expectedSum / randomTotal;
    const result = randomFloats.map((value) => Math.floor(value * factor));

    // Step 4: Resolve rounding errors by increasing some elements randomly until the given sum is reached
    // The actual sum will always be less than or equal to the target sum since Math.floor was used in the previous step
    let actualSum = result.reduce((partialSum, a) => partialSum + a, 0);
    while (actualSum < expectedSum) {
      const incrementAt = getRandomInt(count);
      result[incrementAt]++;
      actualSum = result.reduce((partialSum, a) => partialSum + a, 0);
    }
    return result;
  }
}
