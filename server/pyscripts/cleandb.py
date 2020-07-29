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
cursors = dataset.find({})

mongokey = os.getenv('MONGO')
client = MongoClient(mongokey)
db = client.get_database('whisperify-prod')
records = db.users
print(records.count_documents( {} ))

count = 0
for user in cursors:
    count += 1
    if count % 100 == 0:
        print(count, "done")
    if count < 12300:
        continue

    username = user.get("_id")
    score = user.get("score")
    tries = user.get("attempts")
    host = ""
    if (score and tries):
      ## Post to new dataset db
      continue
      # print(user)
      # records.update_one({"_id": username}, {"$set": { "total": score * tries}}, upsert=True)
    else:
      print(username, score, tries)
      records.delete_one({"_id": username})

print("completed")
