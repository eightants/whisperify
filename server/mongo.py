from pymongo import MongoClient
client = MongoClient("ENV.mongouri")

db = client.get_database('whisperify-prod')
records = db.users

cursors = records.find({})
#print(records.count_documents( { 'score': { '$gte': 0 } } ))
count = 0
for user in cursors:
    count += 1
    if count % 1000 == 0:
        print(count)
    trk = user.get("tracks")[:50]
    records.update_one({"_id": user["_id"]}, {"$set":
        {"tracks": trk}
    })


