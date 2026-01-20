#!/usr/bin/env python3
import json
import os
from pymongo import MongoClient
from bson import ObjectId

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['capstone']

# Function to convert MongoDB Extended JSON to regular JSON
def convert_extended_json(obj):
    if isinstance(obj, dict):
        if '$oid' in obj:
            return ObjectId(obj['$oid'])
        elif '$date' in obj:
            # Return as is - PyMongo will handle it
            return obj
        else:
            return {k: convert_extended_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_extended_json(item) for item in obj]
    else:
        return obj

# Import collections
base_path = r'C:\Users\resty\Desktop\database\capstone-20260119T150046Z-3-001\capstone'

collections = [
    ('analyticsevents', 'capstone.analyticsevents.json'),
    ('capstones', 'capstone.capstones.json'),
    ('users', 'capstone.users.json')
]

for collection_name, file_name in collections:
    file_path = os.path.join(base_path, file_name)
    print(f"\nImporting {collection_name}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        collection = db[collection_name]
        
        # Clear existing data
        collection.delete_many({})
        
        # Convert extended JSON
        if isinstance(data, list):
            data = [convert_extended_json(item) for item in data]
        else:
            data = convert_extended_json(data)
        
        # Insert data
        if isinstance(data, list):
            result = collection.insert_many(data)
            print(f"✓ Inserted {len(result.inserted_ids)} documents into {collection_name}")
        else:
            result = collection.insert_one(data)
            print(f"✓ Inserted 1 document into {collection_name}")
            
    except Exception as e:
        print(f"✗ Error importing {collection_name}: {e}")

print("\n✓ Database import completed!")
client.close()
