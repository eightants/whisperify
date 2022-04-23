from pymongo import MongoClient
import os, math 
from dotenv import load_dotenv
load_dotenv()

mongokey = os.getenv('MONGO')

client = MongoClient(mongokey)

db = client.get_database('whisperify-prod')
records = db.users

cursors = records.find({'score': {"$gte": 2000}})
print(records.count_documents( { '$expr': { '$lte': [2400, {'$divide': ['$total','$attempts']}] } } ))
# print(records.count_documents( { 'score': { '$gte': 2000 } } ))
# print(records.count_documents( {'tracks.50': {"$exists": True}} ))

# count = 0
# for user in cursors:
#     count += 1
#     if count % 100 == 0:
#         print(count)
#     score = math.floor(user.get("score") * 0.95)
#     records.update_one({"_id": user["_id"]}, {"$set":
#         {"score": score}
#     })


