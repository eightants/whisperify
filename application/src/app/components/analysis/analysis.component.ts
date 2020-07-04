import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SpotifyService } from '../services/spotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import {COUNTRY_TO_CODE, COUNTRIES, PERSONALITIES, FEATURES_DESC} from '../../globals'

function findKey(arr, key, category) {
  var retObj = null;
  for (var i in arr) {
    var obj = arr[i];
    if (category == "country" && obj["_id"] == key) {
      retObj = obj;
      break;
    } else if (category == "personality") {
      var match = true
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

function parsePersonality(brig) {
  var str = brig.toLowerCase();
  return ({
    ei: str[0], 
    sn: str[1],
    tf: str[2], 
    jp: str[3] 
  })
}

const COUNTRY_TYPE = "country";
const PERSONALITY_TYPE = "personality";
const featuresToAdd = ["acousticness", "danceability", "energy", "valence", "liveness", "speechiness"];

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
  urlchange;
  featuresDesc = FEATURES_DESC;
  chartName = "main-radar";
  chartData;
  chartConfig;
  multiChartConfig;
  dotChartConfig;
  keyChartConfig;
  changed;
  tracks = [];
  trackprev= [];
  artists = [];
  genres = [];
  token;
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
  nameFieldVal="";
  chartTypes = ["Dot", "Radar","Multi"];
  chosenChart = "Dot";
  editLabel=-1;
  showTools=true;
  userGraphLimit=32;

  constructor(private spotify:SpotifyService, private router:Router, private route:ActivatedRoute) { }

  ngOnInit() {
    this.graphColors = ["#414141", "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    this.changed = true;
    this.graphTitles = ["Key"]
    this.chartData = [
      [
        {axis: "acousticness", value: 0},
        {axis: "danceability", value: 0}, 
        {axis: "energy", value: 0},
        {axis: "valence", value: 0}, 
        {axis: "liveness", value: 0},
        {axis: "speechiness", value: 0}
      ]
    ];
    this.chartConfig = {
      maxValue: 0.8,
      levels: 5,
      showAxesLabels: true,
      color: this.buildColor(this.graphColors)
    }
    this.dotChartConfig = {
      showAxes: false,
      width: 500,
      height: 50,
      radius: "8px",
      lineStroke: "4px",
      lineColor: "#2e2e2e",
      lineToMatchAxes: true,
      color: this.buildColor(this.graphColors)
    }
    this.keyChartConfig = {
      maxValue: 0.9,
      levels: 5,
      showAxesLabels: true,
      axesLabelsSize: "20px"
    }
    this.multiChartConfig = {
      maxValue: 0.9,
      levels: 5,
      dotRadius: 5, 			
	    strokeWidth: 5, 
      showAxesLabels: false,
      chartType: "multi"
    }
    // if user visits /analysis/:spotifyuserid, the user id is parsed and a graph is plotted for that user id
    this.urlchange = this.route.params.subscribe(params => {
      let isCode = params["code"] || "";
      //console.log(isCode)
      if (isCode != "") {
        this.spotify.getUserAnalysis(isCode).then(res=>{
          this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(res, featuresToAdd)));
          this.graphTitles.push(isCode)
          this.updateGraph();
        })
      }
    });
    // gets global stats
    this.spotify.getGroupAnalysis("all").then((res)=> {
      this.allAnalysis = res[0];
      this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(res[0], featuresToAdd)));
      this.graphTitles.push("Global")
      this.updateGraph();
    });

    /*
    SPOTIFY CALLS
    */
    this.token = sessionStorage.getItem("token");
    //console.log(this.token);
    if (this.token == "" || this.token == null) {
      this.userGraphLimit = 16;
    } else {
      // grabs listening activity from Spotify
      this.spotify.getTracks(this.token, "0", "medium_term").then(
        res => {
          this.trackprev = res['items']
          this.tracks = this.trackprev;
          this.isLoaded = true;
          let songIds = this.tracks.map(({ id }) => id)
          this.renderUserAudioFeatures(songIds, featuresToAdd);
        }
      ).catch((e) => {
        console.log(e);
      });

      // get top artists and genres
      this.spotify.getArtists(this.token, "0", "medium_term").then(
        res => {
          this.artists = res['items']
          console.log(this.artists);
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
          this.genres.sort(function(a, b) {
              return b[1] - a[1];
          });
          console.log(this.genres);
        }
      ).catch((e) => {
        console.log(e);
      });
    }
  }

  buildColor(arr) {
    return d3.scaleOrdinal().range(arr);
  }

  capitalize(str) {
    return (str.replace(/(^\w|\s\w)/g, m => m.toUpperCase()));
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
    } else if (val == "Country"){
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
        this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(findKey(this.personalityAnalysis, parsePersonality(this.chosenSecond), PERSONALITY_TYPE), featuresToAdd)));
        this.graphTitles.push(this.chosenSecond.toUpperCase())
        this.updateGraph();
      } else {
        this.spotify.getGroupAnalysis(PERSONALITY_TYPE).then((res)=> {
          this.personalityAnalysis = res;
          this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(findKey(res, parsePersonality(this.chosenSecond), PERSONALITY_TYPE), featuresToAdd)));
          this.graphTitles.push(this.chosenSecond.toUpperCase())
          this.updateGraph();
        });
      }
    } else if (this.chosenType == "Country") {
      if (this.countryAnalysis) {
        this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(findKey(this.countryAnalysis, COUNTRY_TO_CODE[this.chosenSecond], COUNTRY_TYPE), featuresToAdd)));
        this.graphTitles.push(this.chosenSecond)
        this.updateGraph();
      } else {
        this.spotify.getGroupAnalysis(COUNTRY_TYPE).then((res)=> {
          this.countryAnalysis = res;
          this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(findKey(res, COUNTRY_TO_CODE[this.chosenSecond], COUNTRY_TYPE), featuresToAdd)));
          this.graphTitles.push(this.chosenSecond)
          this.updateGraph();
        });
      }
    } else if (this.chosenType == "Album") {
      var urlSplit = this.inputFieldVal.split("/");
      var albumID = ""
      for (var i = 0; i < urlSplit.length; i++) {
        if (urlSplit[i] == "album") {
          albumID = urlSplit[i+1];
          break;
        }
      }
      this.inputFieldVal = "";
      this.spotify.getAlbumAnalysis(albumID).then((res) => {
        this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(res["features"], featuresToAdd)));
        this.graphTitles.push(res["title"])
        this.updateGraph();
      })
    } else if (this.chosenType == "User") {
      var urlSplit = this.inputFieldVal.split("/");
      var userID = ""
      for (var i = 0; i < urlSplit.length; i++) {
        if (urlSplit[i] == "user") {
          userID = urlSplit[i+1];
          break;
        }
      }
      this.inputFieldVal = "";
      this.spotify.getUserAnalysis(userID).then((res)=> {
          this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(res, featuresToAdd)));
          this.graphTitles.push(userID)
          this.updateGraph();
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
    this.spotify.getUserAudioFeatures(this.token, songIds).then(
      feat => {
        let averageFeatures = feat["audio_features"][0];
        console.log(averageFeatures);
        for (let i = 1; i < feat["audio_features"].length; i++) {
          for (let j = 0; j < featuresToAdd.length; j++) {
            averageFeatures[featuresToAdd[j]] += feat["audio_features"][i][featuresToAdd[j]];
          }
        }
        for (let j = 0; j < featuresToAdd.length; j++) {
          averageFeatures[featuresToAdd[j]] /= feat["audio_features"].length;
        }
        console.log(averageFeatures);
        this.chartData.push(this.buildFeatureObject(this.normalizeLowVals(averageFeatures, featuresToAdd)));
        this.graphTitles.push("You");
        this.updateGraph();
      }
    );
    return;
  }

  compressFeatureObject(averageFeatures) {
    return ({
      "acousticness": averageFeatures["acousticness"],
      "danceability": averageFeatures["danceability"], 
      "energy": averageFeatures["energy"],
      "valence": averageFeatures["valence"], 
      "liveness": averageFeatures["liveness"],
      "speechiness": averageFeatures["speechiness"]
    });
  }

  buildFeatureObject(averageFeatures) {
    return ([
      {axis: "acousticness", value: averageFeatures["acousticness"]},
      {axis: "danceability", value: averageFeatures["danceability"]}, 
      {axis: "energy", value: averageFeatures["energy"]},
      {axis: "valence", value: averageFeatures["valence"]}, 
      {axis: "liveness", value: averageFeatures["liveness"]},
      {axis: "speechiness", value: averageFeatures["speechiness"]}
    ]);
  }

  buildDotPlotData(data, labels) {
    var dataObj = []
    var firstObj = data[0];
    for (var g in firstObj) {
      dataObj.push({
        group: firstObj[g]["axis"]
      });
    }
    for (var plot in data) {
      for (var axis in data[plot]) {
        var d = data[plot][axis];
        dataObj[axis][labels[plot]] = d["value"]
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
}
