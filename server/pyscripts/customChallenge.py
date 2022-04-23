from pymongo import MongoClient
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
# loads env vars
load_dotenv()

#info needed to make calls
challengetitle = "All BTOB Songs"
cc = "btoball" # challenge code (used in url)
choice = 2
givenURL = "https://open.spotify.com/playlist/6wnuLkPAXtayZgYxNRiqLz?si=DX5PofNhSDW6a__I4VH6xQ&dl_branch=1&nd=1"
username = "eightants" # not used for option 1/2


albumlist = {}
albuminfo = {}

if choice == 1:
    client_credentials_manager = SpotifyClientCredentials(client_id=os.getenv('CLIENT_ID'), client_secret=os.getenv('CLIENT_SECRET'))
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    albumlist = sp.album_tracks(givenURL)
    albuminfo = sp.album(givenURL)
    albumlist = albumlist["items"]
elif choice == 2:
    client_credentials_manager = SpotifyClientCredentials(client_id=os.getenv('CLIENT_ID'), client_secret=os.getenv('CLIENT_SECRET'))
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    albumlist = sp.playlist_tracks(givenURL)
    albuminfo = sp.playlist(givenURL)
    albumlist = albumlist["items"]
    innertracks = []
    for item in albumlist:
        innertracks.append(item["track"])
    albumlist = innertracks
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
    if song["preview_url"] == None:
        continue
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



