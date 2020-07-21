from pymongo import MongoClient
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import numpy as np

# loads env vars
load_dotenv()

client_credentials_manager = SpotifyClientCredentials(client_id=os.getenv('CLIENT_ID'), client_secret=os.getenv('CLIENT_SECRET'))
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

challengekey = os.getenv('DATASET_DB')
# code to add this dataObj to the challenge database with the custom id
challengeclient = MongoClient(challengekey)
challengedb = challengeclient.get_database('analysis-prod')
dataset = challengedb.dataset

mongokey = os.getenv('MONGO')
client = MongoClient(mongokey)
db = client.get_database('whisperify-prod')
records = db.users
cursors = records.find({})
print(records.count_documents( {} ))

count = 0
for user in cursors:
    songlist = []
    count += 1
    if count % 100 == 0:
        print(count, "done")
    if count < 0:
        break
    tracks = user.get("tracks")
    username = user.get("_id")
    usercountry = user.get("country")
    for track in tracks:
        songid = track["external_urls"]["spotify"].split("/")[4]
        songlist.append(songid)

    """
    Gets the audio features for all the users top 50 tracks
    """
    audioinfo = sp.audio_features(songlist)
    ## build data object
    '''
    dataObj = {
        "_id": username, 
        "acousticness": round(np.mean([a["acousticness"] for a in audioinfo if a is not None]), 3),
        "danceability": round(np.mean([a["danceability"] for a in audioinfo if a is not None]), 3),
        "energy": round(np.mean([a["energy"] for a in audioinfo if a is not None]), 3), 
        "valence": round(np.mean([a["valence"] for a in audioinfo if a is not None]), 3),  
        "liveness": round(np.mean([a["liveness"] for a in audioinfo if a is not None]), 3), 
        "speechiness": round(np.mean([a["speechiness"] for a in audioinfo if a is not None]), 3),
        "instrumentalness": round(np.mean([a["instrumentalness"] for a in audioinfo if a is not None]), 3),
        "tempo": round(np.mean([a["tempo"] for a in audioinfo if a is not None]), 3), 
        "loudness": round(np.mean([a["loudness"] for a in audioinfo if a is not None]), 3),
        "country": usercountry,
        "score": user.get("score"), 
        "name": user.get("name"), 
        "attempts": user.get("attempts") if user.get("attempts") is not None else 3, 
        "tracks": songlist, 
        "time": user.get("time") if user.get("time") is not None else 420
    }
    '''
    dataObj = {
        "_id": username, 
        "tracks": songlist if len(songlist) > 0 else "error", 
    }
    records.update_one({"_id": dataObj["_id"]}, {"$set": dataObj}, upsert=True)
    """
    Checks if that user had submitted a response for the personality survey
    """
    '''
    svrecords = db.responses
    survey = {}
    matches = svrecords.count_documents({"_id": username})
    if (matches > 0):
        survey = svrecords.find({"_id": username})
        survey = survey[0]
        dataObj["ei"] = survey["ei"]
        dataObj["jp"] = survey["jp"]
        dataObj["sn"] = survey["sn"]
        dataObj["tf"] = survey["tf"]
        dataObj["song"] = survey["song"]
    '''
    ## Post to new dataset db
    ##dataset.update_one({"_id": dataObj["_id"]}, {"$set": dataObj}, upsert=True)

print("completed")


'''
CODE to fix NaN entries (need to change db submission code to ensure that tracks are actually submitted)
'''
'''
invalid = dataset.find({"acousticness": np.nan})
print(dataset.count_documents( {"acousticness": np.nan} ))
dataObj = {
        "acousticness": 0.3,
        "danceability": 0.3,
        "energy": 0.3, 
        "valence": 0.3,  
        "liveness": 0.3, 
        "speechiness": 0.3,
        "tempo": 0.3, 
        "loudness": 0.3,
        "instrumentalness": 0.3
    }
for iv in invalid:
    dataset.update_one({"_id": iv.get("_id")}, {"$set": dataObj}, upsert=True)
'''
