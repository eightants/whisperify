import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { TitleTagService } from "../services/title-tag.service";
import { SpotifyService } from "../services/spotify.service";

function getDateToday() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  return dd + "/" + mm + "/" + yyyy;
}

@Component({
  selector: "app-tracks",
  templateUrl: "./tracks.component.html",
  styleUrls: ["./tracks.component.scss"],
})
export class TracksComponent implements OnInit {
  @HostListener("window:scroll", ["$event"])
  scrollCheck(event) {
    this.upperPart = window.pageYOffset < 1000;
  }

  constructor(
    private router: Router,
    private spotify: SpotifyService,
    private titleTagService: TitleTagService
  ) {}

  token = "";
  tracks = [];
  trackprev = [];
  trackshort = [];
  tracklong = [];
  artists = [];
  artistprev = [];
  artistshort = [];
  artistlong = [];
  isLoaded = false;
  indexes = [];
  topTypes = ["Tracks", "Artists"];
  chosenType = "Tracks";
  timePeriod = ["4 weeks", "6 months", "Lifetime"];
  chosenPeriod = "6 months";
  songuris = [];
  upperPart = true;
  generated = {
    "4 weeks": "",
    "6 months": "",
    Lifetime: "",
  };

  ngOnInit() {
    this.titleTagService.setTitle("Favourites - Whisperify");
    this.titleTagService.setSocialMediaTags(
      "Favourites - Whisperify",
      "View and save your top songs and artists on Spotify over time. "
    );
    this.token = sessionStorage.getItem("token");
    this.upperPart = true;
    //console.log(this.token);
    if (this.token == "" || this.token == null) {
      this.router.navigate(["/"]);
    }
    // get request
    this.spotify
      .getTracks(this.token, "0", "medium_term")
      .then((res) => {
        this.spotify.getTracks(this.token, "49", "medium_term").then((res2) => {
          //console.log(res);
          this.trackprev = res["items"].concat(res2["items"].slice(1));
          this.tracks = this.trackprev;
          //console.log(this.tracks.length)
          this.isLoaded = true;
        });
      })
      .catch((e) => {
        console.log(e);
        this.router.navigate(["/"]);
      });
    this.spotify.getArtists(this.token, "0", "medium_term").then((res) => {
      this.artistprev = res["items"];
      this.artists = this.artistprev;
    });
  }

  calculatePopularity(artists) {
    return Math.floor(
      artists.reduce((a, b) => a + (b["popularity"] || 0), 0) / artists.length
    );
  }

  choosePeriod(val) {
    this.chosenPeriod = val;
    if (val == "4 weeks") {
      if (this.trackshort.length < 1) {
        // SHORT TERM
        this.spotify
          .getTracks(this.token, "0", "short_term")
          .then((res) => {
            this.trackshort = res["items"];
            this.tracks = this.trackshort;
          })
          .catch((e) => {
            console.log(e);
          });
        this.spotify.getArtists(this.token, "0", "short_term").then((res) => {
          this.artistshort = res["items"];
          this.artists = this.artistshort;
        });
      } else {
        this.tracks = this.trackshort;
        this.artists = this.artistshort;
      }
    } else if (val == "Lifetime") {
      if (this.tracklong.length < 1) {
        // LONG TERM
        this.spotify
          .getTracks(this.token, "0", "long_term")
          .then((res) => {
            this.spotify
              .getTracks(this.token, "49", "long_term")
              .then((res2) => {
                this.tracklong = res["items"].concat(res2["items"].slice(1));
                this.tracks = this.tracklong;
              });
          })
          .catch((e) => {
            console.log(e);
          });
        this.spotify.getArtists(this.token, "0", "long_term").then((res) => {
          this.artistlong = res["items"];
          this.artists = this.artistlong;
        });
      } else {
        this.tracks = this.tracklong;
        this.artists = this.artistlong;
      }
    } else {
      this.tracks = this.trackprev;
      this.artists = this.artistprev;
    }
  }

  makePlaylist() {
    this.songuris = [];
    this.spotify.getProfile(this.token).then((useres) => {
      this.spotify
        .createPlaylist(
          this.token,
          useres["id"],
          this.chosenPeriod + " Top Tracks (" + getDateToday() + ")",
          this.whichDesc()
        )
        .then((playlistObj) => {
          for (let i = 0; i < this.tracks.length; i++) {
            this.songuris.push(this.tracks[i]["uri"]);
          }
          this.spotify
            .addPlaylistSongs(this.token, playlistObj["id"], this.songuris)
            .then((snapshot) => {
              if (snapshot["snapshot_id"]) {
                this.generated[this.chosenPeriod] =
                  playlistObj["external_urls"]["spotify"];
              }
            });
        });
    });
  }

  whichDesc() {
    if (this.chosenPeriod == "4 weeks") {
      return (
        "Your favorite tracks for the last 4 weeks as of " +
        getDateToday() +
        ". Created from whisperify.net"
      );
    } else if (this.chosenPeriod == "Lifetime") {
      return (
        "Your favorite tracks of all time as of " +
        getDateToday() +
        ". Created from whisperify.net"
      );
    } else {
      return (
        "Your favorite tracks for the last 6 months as of " +
        getDateToday() +
        ". Created from whisperify.net"
      );
    }
  }

  scrollTo(id) {
    document.getElementById(id).scrollIntoView();
  }
}
