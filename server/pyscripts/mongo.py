from pymongo import MongoClient
import os, math 
from dotenv import load_dotenv
load_dotenv()

mongokey = os.getenv('DATASET_DB')
mongokey2 = os.getenv('DATASET_DB_2')

client = MongoClient(mongokey)

db = client.get_database('analysis-prod')
records = db.dataset

cursors = records.find({'time': {"$lte": 420}})
# print(records.count_documents( { '$expr': { '$lte': [2400, {'$divide': ['$total','$attempts']}] } } ))
print(records.count_documents( { 'time': { '$lte': 420 } } ))
# print(records.count_documents( {'tracks.50': {"$exists": True}} ))

client2 = MongoClient(mongokey2)

db2 = client2.get_database('analysis-prod')
records2 = db2.dataset

count = 0
for user in cursors:
    count += 1
    if count % 500 == 0:
        print(count)
    records2.update_one({"_id": user["_id"]}, {"$set":
        user
    }, upsert=True)


records.delete_many({'time': {"$lte": 420}})

