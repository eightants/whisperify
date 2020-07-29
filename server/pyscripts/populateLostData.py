from pymongo import MongoClient
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import numpy as np

# loads env vars
load_dotenv()

challengekey = os.getenv('CHALLENGE_DB')
# code to add this dataObj to the challenge database with the custom id
challengeclient = MongoClient(challengekey)
challengedb = challengeclient.get_database('challenge-prod')
challenges = challengedb.codes
cursors = challenges.find({"title": { '$exists': False}})


datakey = os.getenv('DATASET_DB')
# code to add this dataObj to the data database with the custom id
dataclient = MongoClient(datakey)
datadb = dataclient.get_database('analysis-prod')
dataset = datadb.dataset

# mongokey = os.getenv('MONGO')
# client = MongoClient(mongokey)
# db = client.get_database('whisperify-prod')
# records = db.users
# cursors = records.find({ "email": { '$exists': True, '$ne': np.nan } })
# print(records.count_documents( {} ))

count = 0
for user in cursors:
    count += 1
    if count % 30 == 0:
        print(count, "done")
    if count < 0:
        break

    username = ""
    ccode = user.get("_id")
    mytime = user.get("time")
    board = user.get("scoreboard")
    host = ""
    for b in board:
      if b.get("host") == True:
        host = b["name"]

    print(host)
    if host =="":
      print("delete")
      challenges.delete_one({"_id": ccode})
      

    # possibleUsers = dataset.find({ "time": { '$gte': mytime } })
    # for p in possibleUsers:
    #   if p.get("name") == host:
    #     username = p.get("_id")
    #     print("found: ", username)
    #     break
    


    ## Post to new dataset db
    # if username != "":
    #   challenges.update_one({"_id": ccode}, {"$set": { "hostid": username}}, upsert=True)

print("completed")
