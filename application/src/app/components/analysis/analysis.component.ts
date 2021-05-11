import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { TitleTagService } from "../services/title-tag.service";
import * as d3 from "d3";
import { SpotifyService } from "../services/spotify.service";
import { ActivatedRoute } from "@angular/router";
import {
  COUNTRY_TO_CODE,
  COUNTRIES,
  PERSONALITIES,
  FEATURES_DESC,
  MAINURL,
  allFeaturesToAdd,
} from "../../globals";

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(" ");
  var line = "";
  var lineWrites = [];
  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + " ";
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lineWrites.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  // write the remaining text
  context.fillText(line, x, y);
  for (var n = lineWrites.length - 1; n >= 0; n--) {
    // then write text from bottom up
    y -= lineHeight;
    context.fillText(lineWrites[n], x, y);
  }
}

/**
 * Find the object in audio features response that corresponds to the key passed in
 * @param arr
 * @param key
 * @param category
 */
function findKey(arr, key, category) {
  var retObj = null;
  for (var i in arr) {
    var obj = arr[i];
    if (category == "country" && obj["_id"] == key) {
      retObj = obj;
      break;
    } else if (category == "personality") {
      var match = true;
      for (var prop in obj["_id"]) {
        if (obj["_id"][prop] == {} || obj["_id"][prop] != key[prop]) {
          match = false;
          break;
        }
      }
      if (match) {
        retObj = obj;
        break;
      }
    }
  }
  return retObj;
}

/**
 * Generates the db personality object from a string MB personality, to be used in findKey
 * @param brig
 */
function parsePersonality(brig) {
  var str = brig.toLowerCase();
  return {
    ei: str[0],
    sn: str[1],
    tf: str[2],
    jp: str[3],
  };
}

const COUNTRY_TYPE = "country";
const PERSONALITY_TYPE = "personality";
const featuresToAdd = [
  "acousticness",
  "danceability",
  "energy",
  "valence",
  "liveness",
  "speechiness",
];

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.component.html",
  styleUrls: ["./analysis.component.scss"],
})
export class AnalysisComponent implements OnInit {
  @ViewChild("toSave", { static: false }) toSave: ElementRef;
  @ViewChild("canvasImg", { static: false }) canvasImg: ElementRef;
  @ViewChild("radarDraw", { static: false }) radarDraw: ElementRef;

  urlchange;
  urlNeed = true;
  featuresDesc = FEATURES_DESC;
  chartName = "main-radar";
  chartData;
  chartConfig;
  multiChartConfig;
  dotChartConfig;
  keyChartConfig;
  imageConfig;
  changed;
  tracks = [];
  trackprev = [];
  artists = [];
  artistSpan = 0;
  popularity;
  genres = [];
  token;
  username;
  myAudioFeatures = {};
  isLoaded = false;
  originalFeatures = {};
  graphColors;
  graphTitles;
  countryAnalysis;
  personalityAnalysis;
  allAnalysis = {};
  dataType = ["Country", "Personality", "Album", "User"];
  chosenType = "Country";
  sortedCountries = COUNTRIES.sort();
  secondDropdownData = this.sortedCountries;
  chosenSecond = this.sortedCountries[0];
  inputFieldVal = "";
  nameFieldVal = "";
  chartTypes = ["Dot", "Radar", "Multi"];
  chosenChart = "Radar";
  editLabel = -1;
  showTools = true;
  showPopTip = false;
  userGraphLimit = 32;
  selectedPlot = 1;
  errorText = "Error";
  errorShow = false;
  personalChart;
  chosenTone;
  primaryTones = ["#0099FF", "#e91628", "#f65e35"];
  secondaryTones = ["#1d3162", "#1c3775", "#1e3265"];

  constructor(
    private spotify: SpotifyService,
    private route: ActivatedRoute,
    private titleTagService: TitleTagService
  ) {}

  ngOnInit() {
    this.titleTagService.setTitle(
      "Whisperify Analysis - View your music in interesting ways!"
    );
    this.titleTagService.setSocialMediaTags(
      "Whisperify Analysis - View your music in interesting ways!",
      "Compare your listening habits with Spotify users from over 70 countries and the 16 Meyer-Briggs personalities in unique charts. Try analysing your favourite albums, or view a breakdown of your friends' tastes!"
    );
    // INITIALIZING ALL THE INFO WE NEED
    this.chosenTone = Math.floor(Math.random() * 3);
    this.graphColors = [
      "#414141",
      "#3366cc",
      "#dc3912",
      "#ff9900",
      "#109618",
      "#990099",
      "#0099c6",
      "#dd4477",
      "#66aa00",
      "#b82e2e",
      "#316395",
      "#994499",
      "#22aa99",
      "#aaaa11",
      "#6633cc",
      "#e67300",
      "#8b0707",
      "#651067",
      "#329262",
      "#5574a6",
      "#3b3eac",
    ];
    this.changed = true;
    this.graphTitles = ["Key"];
    this.chartData = [
      [
        { axis: "acousticness", value: 0 },
        { axis: "danceability", value: 0 },
        { axis: "energy", value: 0 },
        { axis: "valence", value: 0 },
        { axis: "liveness", value: 0 },
        { axis: "speechiness", value: 0 },
      ],
    ];
    this.personalChart = [
      [
        { axis: "acousticness", value: 0 },
        { axis: "danceability", value: 0 },
        { axis: "energy", value: 0 },
        { axis: "valence", value: 0 },
        { axis: "liveness", value: 0 },
        { axis: "speechiness", value: 0 },
      ],
    ];
    this.chartConfig = {
      maxValue: 0.8,
      levels: 5,
      showAxesLabels: true,
      color: this.buildColor(this.graphColors),
    };
    this.dotChartConfig = {
      showAxes: false,
      width: 500,
      height: 50,
      radius: "8px",
      lineStroke: "4px",
      lineColor: "#2e2e2e",
      lineToMatchAxes: true,
      color: this.buildColor(this.graphColors),
    };
    this.keyChartConfig = {
      maxValue: 0.9,
      levels: 5,
      showAxesLabels: true,
      axesLabelsSize: "20px",
    };
    this.multiChartConfig = {
      maxValue: 0.9,
      levels: 5,
      dotRadius: 5,
      strokeWidth: 5,
      showAxesLabels: false,
      chartType: "multi",
    };
    this.imageConfig = {
      maxValue: 0.8,
      levels: 5,
      dotRadius: 0,
      strokeWidth: 15,
      showAxesLabels: false,
      opacityArea: 1,
      labelColor: "none",
      backgroundColor: "none",
      blobGlow: false,
    };
    // -------------------
    // START GETTING DATA
    // -------------------
    // get spotify token
    sessionStorage.setItem("redirect", "");
    this.token = sessionStorage.getItem("token");
    this.username = sessionStorage.getItem("username") || "";
    // if user visits /analysis/:spotifyuserid, the user id is parsed and a graph is plotted for that user id
    this.urlchange = this.route.params.subscribe((params) => {
      let isCode = params["username"] || "";
      if (isCode != "") {
        this.spotify.getUserAnalysis(isCode).then((res) => {
          this.chartData.push(
            this.buildFeatureObject(this.normalizeLowVals(res, featuresToAdd))
          );
          this.graphTitles.push(isCode);
          this.urlNeed = false;
          this.updateGraph();
          if (this.token == "" || this.token == null) {
            this.userGraphLimit = 12;
          } else {
            // grabs listening activity from Spotify
            this.spotify
              .getTracks(this.token, "0", "medium_term")
              .then((res) => {
                this.trackprev = res["items"];
                this.tracks = this.trackprev;
                this.isLoaded = true;
              })
              .catch((e) => {
                console.log(e);
              });
          }
        });
      } else {
        if (this.token == "" || this.token == null) {
          this.userGraphLimit = 12;
        } else {
          // grabs listening activity from Spotify
          this.spotify
            .getTracks(this.token, "0", "medium_term")
            .then((res) => {
              this.trackprev = res["items"];
              this.tracks = this.trackprev;
              this.isLoaded = true;
              let songIds = this.tracks.map(({ id }) => id);
              let artistList = [].concat.apply(
                [],
                this.tracks.map(({ artists }) => artists)
              );
              let artistSet = new Set(artistList.map(({ id }) => id));
              this.artistSpan = artistSet.size;
              this.renderUserAudioFeatures(songIds, featuresToAdd);
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
    });
    // gets global stats
    this.spotify
      .getGroupAnalysis("all")
      .then((res) => {
        this.allAnalysis = res[0];
        this.chartData.push(
          this.buildFeatureObject(this.normalizeLowVals(res[0], featuresToAdd))
        );
        this.graphTitles.push("Global");
        this.updateGraph();
        this.isLoaded = true;
      })
      .catch((e) => {
        console.log(e);
      });

    /*
    OTHER SPOTIFY CALLS
    */
    if (this.token == "" || this.token == null) {
      this.userGraphLimit = 12;
    } else {
      this.dataType = ["Country", "Personality", "Album", "Playlist", "User"];
      // get top artists and genres
      this.spotify
        .getArtists(this.token, "0", "medium_term")
        .then((res) => {
          this.artists = res["items"];
          // calculate average popularity of artists
          this.popularity = Math.floor(
            this.artists.reduce((a, b) => a + (b["popularity"] || 0), 0) /
              this.artists.length
          );
          //-----------------------------------------------------
          // naive method of finding top genres. Hope to implement clustering w/ audio features soon
          //-----------------------------------------------------
          // gets all genres into an array
          let genreList = this.artists.map(({ genres }) => genres);
          genreList = [].concat.apply([], genreList);
          // counts the number of each genres (this is where related genres are ignored, thus the need for clustering)
          var genreCounts = {};
          for (var i = 0; i < genreList.length; i++) {
            var num = genreList[i];
            genreCounts[num] = genreCounts[num] ? genreCounts[num] + 1 : 1;
          }
          // sorts genres in descending order
          for (var g in genreCounts) {
            this.genres.push([g, genreCounts[g]]);
          }
          this.genres.sort(function (a, b) {
            return b[1] - a[1];
          });
          this.generateImage();
          //console.log(this.genres);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  getSongsAndPostToDB() {
    if (this.token != "" && this.token != null && this.username == "") {
      this.spotify
        .getTracks(this.token, "0", "medium_term")
        .then((res) => {
          this.spotify
            .getTracks(this.token, "49", "medium_term")
            .then((res2) => {
              this.tracks = res["items"].concat(res2["items"]);
              this.spotify.getProfile(this.token).then((useres) => {
                this.username = useres["id"];
                let displayName = useres["display_name"];
                sessionStorage.setItem("displayname", displayName);
                sessionStorage.setItem("username", this.username);
                let songList = this.tracks.map(({ id }) => id);
                // get audio features for this user
                this.spotify
                  .getUserAudioFeatures(this.token, songList)
                  .then((feat) => {
                    let averageFeatures = feat["audio_features"][0];
                    //console.log(averageFeatures);
                    for (let i = 1; i < feat["audio_features"].length; i++) {
                      for (let j = 0; j < allFeaturesToAdd.length; j++) {
                        averageFeatures[allFeaturesToAdd[j]] +=
                          feat["audio_features"][i][allFeaturesToAdd[j]];
                      }
                    }
                    for (let j = 0; j < allFeaturesToAdd.length; j++) {
                      averageFeatures[allFeaturesToAdd[j]] /=
                        feat["audio_features"].length;
                    }
                    let cleanedFeatures = {};
                    for (let j = 0; j < allFeaturesToAdd.length; j++) {
                      cleanedFeatures[allFeaturesToAdd[j]] =
                        averageFeatures[allFeaturesToAdd[j]];
                    }
                    this.spotify.addEntry({
                      _id: useres["id"],
                      email: useres["email"],
                      name: useres["display_name"],
                      time: Date.now(),
                      tracks: songList,
                      country: useres["country"],
                      ...cleanedFeatures,
                    });
                  });
              });
            });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  ngAfterViewInit() {
    this.generateImage();
  }

  buildColor(arr) {
    return d3.scaleOrdinal().range(arr);
  }

  capitalize(str) {
    return str.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  }

  editName(i) {
    this.nameFieldVal = this.graphTitles[i];
    this.editLabel = i;
  }

  saveName(i) {
    this.graphTitles[i] = this.nameFieldVal;
    this.editLabel = -1;
  }

  chooseType(val) {
    this.chosenType = val;
    if (val == "Personality") {
      this.secondDropdownData = PERSONALITIES;
      this.chosenSecond = PERSONALITIES[0];
    } else if (val == "Country") {
      this.secondDropdownData = this.sortedCountries;
      this.chosenSecond = this.capitalize(this.sortedCountries[0]);
    }
  }

  chooseSecond(val) {
    this.chosenSecond = val;
  }

  addGraph() {
    if (this.chosenType == "Personality") {
      if (this.personalityAnalysis) {
        this.chartData.push(
          this.buildFeatureObject(
            this.normalizeLowVals(
              findKey(
                this.personalityAnalysis,
                parsePersonality(this.chosenSecond),
                PERSONALITY_TYPE
              ),
              featuresToAdd
            )
          )
        );
        this.graphTitles.push(this.chosenSecond.toUpperCase());
        this.updateGraph();
      } else {
        this.spotify.getGroupAnalysis(PERSONALITY_TYPE).then((res) => {
          this.personalityAnalysis = res;
          this.chartData.push(
            this.buildFeatureObject(
              this.normalizeLowVals(
                findKey(
                  res,
                  parsePersonality(this.chosenSecond),
                  PERSONALITY_TYPE
                ),
                featuresToAdd
              )
            )
          );
          this.graphTitles.push(this.chosenSecond.toUpperCase());
          this.updateGraph();
        });
      }
    } else if (this.chosenType == "Country") {
      if (this.countryAnalysis) {
        this.chartData.push(
          this.buildFeatureObject(
            this.normalizeLowVals(
              findKey(
                this.countryAnalysis,
                COUNTRY_TO_CODE[this.chosenSecond],
                COUNTRY_TYPE
              ),
              featuresToAdd
            )
          )
        );
        this.graphTitles.push(this.chosenSecond);
        this.updateGraph();
      } else {
        this.spotify.getGroupAnalysis(COUNTRY_TYPE).then((res) => {
          this.countryAnalysis = res;
          this.chartData.push(
            this.buildFeatureObject(
              this.normalizeLowVals(
                findKey(res, COUNTRY_TO_CODE[this.chosenSecond], COUNTRY_TYPE),
                featuresToAdd
              )
            )
          );
          this.graphTitles.push(this.chosenSecond);
          this.updateGraph();
        });
      }
    } else if (this.chosenType == "Album") {
      // Gets album features from Spotify with user token if exists, or with backend if guest
      var urlSplit = this.inputFieldVal.split("/");
      var albumID = urlSplit[0];
      for (var i = 0; i < urlSplit.length; i++) {
        if (urlSplit[i] == "album") {
          albumID = urlSplit[i + 1];
          break;
        }
      }
      this.inputFieldVal = "";
      if (this.token == "" || this.token == null) {
        this.spotify.getAlbumAnalysisGuest(albumID).then((res) => {
          this.chartData.push(
            this.buildFeatureObject(
              this.normalizeLowVals(res["features"], featuresToAdd)
            )
          );
          this.graphTitles.push(res["title"]);
          this.updateGraph();
        });
      } else {
        this.spotify.getAlbumAnalysis(albumID, this.token).then((res) => {
          this.chartData.push(
            this.buildFeatureObject(
              this.normalizeLowVals(res["features"], featuresToAdd)
            )
          );
          this.graphTitles.push(res["title"]);
          this.updateGraph();
        });
      }
    } else if (this.chosenType == "Playlist") {
      // Gets playlist features from Spotify with user token if exists, or with backend if guest
      var urlSplit = this.inputFieldVal.split("/");
      var playlistID = urlSplit[0];
      for (var i = 0; i < urlSplit.length; i++) {
        if (urlSplit[i] == "playlist") {
          playlistID = urlSplit[i + 1];
          break;
        }
      }
      this.inputFieldVal = "";
      this.spotify.getPlaylistAnalysis(playlistID, this.token).then((res) => {
        this.chartData.push(
          this.buildFeatureObject(
            this.normalizeLowVals(res["features"], featuresToAdd)
          )
        );
        this.graphTitles.push(res["title"]);
        this.updateGraph();
      });
    } else if (this.chosenType == "User") {
      var urlSplit = this.inputFieldVal.split("/");
      var userID = urlSplit[0];
      for (var i = 0; i < urlSplit.length; i++) {
        if (urlSplit[i] == "user") {
          userID = urlSplit[i + 1];
          break;
        }
      }
      this.inputFieldVal = "";
      this.spotify.getUserAnalysis(userID).then((res) => {
        if (res != null) {
          this.chartData.push(
            this.buildFeatureObject(this.normalizeLowVals(res, featuresToAdd))
          );
          this.graphTitles.push(userID);
          this.updateGraph();
        } else {
          this.errorPopup(
            "This user is not on Whisperify. Invite them to join Whisperify to compare your music tastes!"
          );
        }
      });
    }
  }

  updateGraph() {
    this.changed = !this.changed;
  }

  deleteGraph(ind) {
    this.graphTitles.splice(ind, 1);
    //this.graphColors = this.graphTitles.slice(0,ind) + this.graphTitles.slice(ind, this.graphTitles.length);
    this.chartData.splice(ind, 1);
    this.updateGraph();
  }

  renderUserAudioFeatures(songIds, featuresToAdd) {
    this.spotify.getUserAudioFeatures(this.token, songIds).then((feat) => {
      let averageFeatures = feat["audio_features"][0];
      //console.log(averageFeatures);
      for (let i = 1; i < feat["audio_features"].length; i++) {
        for (let j = 0; j < featuresToAdd.length; j++) {
          averageFeatures[featuresToAdd[j]] +=
            feat["audio_features"][i][featuresToAdd[j]];
        }
      }
      for (let j = 0; j < featuresToAdd.length; j++) {
        averageFeatures[featuresToAdd[j]] /= feat["audio_features"].length;
      }
      //console.log(averageFeatures);
      this.personalChart.push(
        this.buildFeatureObject(
          this.normalizeLowVals(averageFeatures, featuresToAdd)
        )
      );
      this.chartData.push(
        this.buildFeatureObject(
          this.normalizeLowVals(averageFeatures, featuresToAdd)
        )
      );
      this.graphTitles.push("You");
      this.updateGraph();
      this.isLoaded = true;
      this.generateImage();
    });
    return;
  }

  compressFeatureObject(averageFeatures) {
    return {
      acousticness: averageFeatures["acousticness"],
      danceability: averageFeatures["danceability"],
      energy: averageFeatures["energy"],
      valence: averageFeatures["valence"],
      liveness: averageFeatures["liveness"],
      speechiness: averageFeatures["speechiness"],
    };
  }

  buildFeatureObject(averageFeatures) {
    return [
      { axis: "acousticness", value: averageFeatures["acousticness"] },
      { axis: "danceability", value: averageFeatures["danceability"] },
      { axis: "energy", value: averageFeatures["energy"] },
      { axis: "valence", value: averageFeatures["valence"] },
      { axis: "liveness", value: averageFeatures["liveness"] },
      { axis: "speechiness", value: averageFeatures["speechiness"] },
    ];
  }

  buildDotPlotData(data, labels) {
    var dataObj = [];
    var firstObj = data[0];
    for (var g in firstObj) {
      dataObj.push({
        group: firstObj[g]["axis"],
      });
    }
    for (var plot in data) {
      for (var axis in data[plot]) {
        var d = data[plot][axis];
        dataObj[axis][labels[plot]] = d["value"];
      }
    }
    return dataObj;
  }

  normalizeLowVals(featureObject, featuresToAdd) {
    for (let j = 0; j < featuresToAdd.length; j++) {
      //console.log(featureObject[featuresToAdd[j]])
      //featureObject[featuresToAdd[j]] += ((1 - featureObject[featuresToAdd[j]]) / 10);
    }
    //console.log(featureObject)
    return featureObject;
  }

  ellipsisName(text, limit) {
    if (text.length > limit) {
      return text.slice(0, limit - 3) + "...";
    } else {
      return text;
    }
  }

  generateImage(mode = "none") {
    if (
      this.artists.length < 5 ||
      this.genres.length < 1 ||
      this.tracks.length < 5
    ) {
      return;
    }
    let imageData;
    let _this = this;
    let ctx = this.toSave.nativeElement.getContext("2d");
    ctx.clearRect(
      0,
      0,
      this.toSave.nativeElement.width,
      this.toSave.nativeElement.height
    );
    let downloadedImg = new Image();
    downloadedImg.crossOrigin = "";
    downloadedImg.onload = function () {
      ctx.drawImage(downloadedImg, 0, 0, 800, 800);
      // wait for loading graph element
      var svg = _this.radarDraw.nativeElement.querySelector(
        "#custom-image-chart svg"
      );
      //console.log(svg);
      var d3img = new Image();
      var serializer = new XMLSerializer();
      var svgStr = serializer.serializeToString(svg);
      d3img.onload = function () {
        // draws graph to canvas on load
        ctx.globalAlpha = 0.5;
        ctx.drawImage(d3img, -650, -100, 1500, 1500);
        ctx.globalAlpha = 1;
        // makes grayscale
        imageData = ctx.getImageData(0, 0, 800, 800);
        const pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
          const red = pixels[i];
          const green = pixels[i + 1];
          const blue = pixels[i + 2];
          // using relative luminance to convert to grayscale
          const avg = Math.round(
            (0.299 * red + 0.587 * green + 0.114 * blue) * 1
          );
          pixels[i] = avg;
          pixels[i + 1] = avg;
          pixels[i + 2] = avg;
        }
        // puts the duotone image into canvas with multiply and lighten
        ctx.putImageData(imageData, 0, 0);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = _this.primaryTones[_this.chosenTone];
        ctx.fillRect(0, 0, 800, 800);
        ctx.globalCompositeOperation = "lighten";
        ctx.fillStyle = _this.secondaryTones[_this.chosenTone];
        ctx.fillRect(0, 0, 800, 800);
        // draws text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "96px Circular";
        ctx.textBaseline = "bottom";
        wrapText(
          ctx,
          _this.genres[0][0] == "pop"
            ? _this.capitalize(_this.genres[1][0])
            : _this.capitalize(_this.genres[0][0]),
          60,
          440,
          600,
          112
        );
        ctx.fillRect(0, 460, 450, 12);
        ctx.textBaseline = "top";
        // draws top tracks
        ctx.font = "20px Open Sans";
        let ycoord = 530;
        ctx.fillText("TOP TRACKS", 200, ycoord);
        ctx.font = "24px Circular";
        for (var i = 0; i < 5; i++) {
          ycoord += 36;
          ctx.fillText(
            _this.ellipsisName(_this.tracks[i].name, 20),
            200,
            ycoord
          );
        }
        // draws top artists
        ctx.font = "20px Open Sans";
        ycoord = 530;
        ctx.fillText("TOP ARTISTS", 500, ycoord);
        ctx.font = "24px Circular";
        for (var i = 0; i < 5; i++) {
          ycoord += 36;
          ctx.fillText(
            _this.ellipsisName(_this.artists[i].name, 20),
            500,
            ycoord
          );
        }
        // draws logo
        ctx.font = "20px Circular";
        ctx.fillText("Whisperify", 650, 39);
        var logo = new Image();
        logo.onload = function () {
          ctx.drawImage(this, 600, 36, 36, 25);
          _this.canvasImg.nativeElement.src = _this.toSave.nativeElement.toDataURL(
            "image/png"
          );
        };
        logo.src = "assets/whisperwave.svg";
      };
      d3img.src = "data:image/svg+xml;base64," + window.btoa(svgStr);
    };
    downloadedImg.src = this.artists[0].images[1].url;
  }

  saveImage() {
    var _this = this;
    var link = document.createElement("a");
    link.addEventListener(
      "click",
      function () {
        link.href = _this.toSave.nativeElement.toDataURL("image/png");
        link.download = "mymusic.png";
      },
      false
    );
    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  errorPopup(text) {
    this.errorText = text;
    this.errorShow = true;
    var _this = this;
    setTimeout(function () {
      _this.errorShow = false;
    }, 5000);
  }

  analysisLogin() {
    sessionStorage.setItem("redirect", "analysis");
    document.location.href = MAINURL + "login";
  }
}
