from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

mongokey = os.getenv('MONGO')

client = MongoClient(mongokey)

db = client.get_database('whisperify-prod')
records = db.users

cursors = records.find({'tracks.50': {"$exists": True}})
#print(records.count_documents( { 'score': { '$gte': 0 } } ))
print(records.count_documents( {'tracks.50': {"$exists": True}} ))

count = 0
for user in cursors:
    count += 1
    if count % 10 == 0:
        print(count)
    trk = user.get("tracks")[:50]
    records.update_one({"_id": user["_id"]}, {"$set":
        {"tracks": trk}
    })


