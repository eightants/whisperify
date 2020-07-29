from pymongo import MongoClient
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
# loads env vars
load_dotenv()

#info needed to make calls
challengetitle = "folklore"
cc = "folklore"
choice = 1
givenURL = "https://open.spotify.com/album/2fenSS68JI1h4Fo296JfGr"
username = "eightants"


albumlist = {}
albuminfo = {}

if choice == 1:
    client_credentials_manager = SpotifyClientCredentials(client_id=os.getenv('CLIENT_ID'), client_secret=os.getenv('CLIENT_SECRET'))
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    albumlist = sp.album_tracks(givenURL)
    albuminfo = sp.album(givenURL)
    albumlist = albumlist["items"]
else:
    mongokey = os.getenv('MONGO')
    client = MongoClient(mongokey)
    db = client.get_database('whisperify-prod')
    records = db.users
    cursors = records.find({'_id': username})
    albumlist = cursors[0]["tracks"]


challengeObj = {
    "_id": cc, 
    "scoreboard": [{"name": "Whisperify", "score": 500, "host": True}], 
    "dynamic": True, 
    "time": 9591234567890, 
    "timeLimit": 20,
    "whisperLen": 5, 
    "title": challengetitle
}
tracklist = []
tracks = []

for song in albumlist:
    print(song["preview_url"])
    
    tladd = {
        "artists": [{"name": song["artists"][0]["name"]}], 
        "name": song["name"]
    }

    albumimg = {}
    if choice == 1:
        albumimg = albuminfo["images"]
    else:
        albumimg = song["album"]["images"]
    
    trkadd = {
        "album": {"images": albumimg}, 
        "artists": [{"name": song["artists"][0]["name"]}], 
        "name": song["name"], 
        "external_urls": song["external_urls"], 
        "preview_url": song["preview_url"]
    }
    tracklist.append(tladd)
    tracks.append(trkadd)

challengekey = os.getenv('CHALLENGE_DB')

challengeObj["tracklist"] = tracklist
challengeObj["tracks"] = tracks

print("challengeObj generated")

# code to add this challegeObj to the challenge database with the custom id
challengeclient = MongoClient(challengekey)
challengedb = challengeclient.get_database('challenge-prod')
challenges = challengedb.codes

challenges.update_one({"_id": challengeObj["_id"]}, {"$set": challengeObj}, upsert=True)

print("Posted with code:", cc)



