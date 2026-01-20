#!/usr/bin/env python3
import json
import os
from pymongo import MongoClient
from bson import ObjectId

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')

# Function to convert MongoDB Extended JSON to regular JSON
def convert_extended_json(obj):
    if isinstance(obj, dict):
        if '$oid' in obj:
            return ObjectId(obj['$oid'])
        elif '$date' in obj:
            return obj
        else:
            return {k: convert_extended_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_extended_json(item) for item in obj]
    else:
        return obj

# Define all databases and their collections
databases = {
    'capstone': [
        ('analyticsevents', r'C:\Users\resty\Desktop\database\capstone-20260119T150046Z-3-001\capstone\capstone.analyticsevents.json'),
        ('capstones', r'C:\Users\resty\Desktop\database\capstone-20260119T150046Z-3-001\capstone\capstone.capstones.json'),
        ('users', r'C:\Users\resty\Desktop\database\capstone-20260119T150046Z-3-001\capstone\capstone.users.json'),
    ],
    'bookstore': [
        ('books', r'C:\Users\resty\Desktop\database\bookstore-20260119T150045Z-3-001\bookstore\bookstore.books.json'),
        ('users', r'C:\Users\resty\Desktop\database\bookstore-20260119T150045Z-3-001\bookstore\bookstore.users.json'),
    ],
    'local': [
        ('startup_log', r'C:\Users\resty\Desktop\database\local-20260119T150047Z-3-001\local\local.startup_log.json'),
    ],
    'SoloConnect': [
        ('messages', r'C:\Users\resty\Desktop\database\solo connect-20260119T150049Z-3-001\solo connect\SoloConnect.messages.json'),
        ('posts', r'C:\Users\resty\Desktop\database\solo connect-20260119T150049Z-3-001\solo connect\SoloConnect.posts.json'),
        ('reports', r'C:\Users\resty\Desktop\database\solo connect-20260119T150049Z-3-001\solo connect\SoloConnect.reports.json'),
        ('users', r'C:\Users\resty\Desktop\database\solo connect-20260119T150049Z-3-001\solo connect\SoloConnect.users.json'),
    ],
}

# Import all databases
for db_name, collections in databases.items():
    print(f"\n{'='*50}")
    print(f"Importing database: {db_name}")
    print(f"{'='*50}")
    
    db = client[db_name]
    
    for collection_name, file_path in collections:
        print(f"\nImporting {collection_name}...")
        
        try:
            if not os.path.exists(file_path):
                print(f"✗ File not found: {file_path}")
                continue
                
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

print(f"\n{'='*50}")
print("✓ All databases imported successfully!")
print(f"{'='*50}")
client.close()
