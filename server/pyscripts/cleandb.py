from pymongo import MongoClient
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import numpy as np

# loads env vars
load_dotenv()

datakey = os.getenv('DATASET_DB')
# code to add this dataObj to the data database with the custom id
dataclient = MongoClient(datakey)
datadb = dataclient.get_database('analysis-prod')
dataset = datadb.dataset

mongokey = os.getenv('MONGO')
client = MongoClient(mongokey)
novel = client.get_database('whisperify-prod')
nv = novel.users

challengekey = os.getenv('CHALLENGE_DB')
# code to add this dataObj to the challenge database with the custom id
challengeclient = MongoClient(challengekey)
challengedb = challengeclient.get_database('challenge-prod')
challenges = challengedb.codes
cursors = challenges.find({"hostid": { '$exists': True}})
print(challenges.count_documents( {} ))

count = 0
for user in cursors:
    count += 1
    if count % 100 == 0:
        print(count, "done")
    if count < 0:
        continue

    username = user.get("hostid")

    if (username):
      ## Post to new dataset db
      #print(username, score, attempts, time)
      nv.update_one({"_id": username}, {"$inc": { "challengesMade": 1}}, upsert=True)

print("completed")
