#!/usr/bin/env python3
"""
Import database from MongoDB Atlas to local MongoDB
Usage: python import_from_atlas.py <ATLAS_CONNECTION_STRING>
Example: python import_from_atlas.py "mongodb+srv://user:password@cluster.mongodb.net/capstone-archive?retryWrites=true&w=majority"
"""

import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def import_from_atlas(atlas_uri, local_uri='mongodb://localhost:27017/'):
    """Import all databases from MongoDB Atlas to local MongoDB"""
    
    print("🔗 Connecting to MongoDB Atlas...")
    atlas_client = MongoClient(atlas_uri)
    
    print("🔗 Connecting to local MongoDB...")
    local_client = MongoClient(local_uri)
    
    try:
        # Get list of databases from Atlas
        atlas_databases = atlas_client.list_database_names()
        print(f"\n📊 Found {len(atlas_databases)} database(s) in Atlas:")
        
        for db_name in atlas_databases:
            if db_name in ['admin', 'config', 'local']:  # Skip system databases
                continue
            
            print(f"\n{'='*60}")
            print(f"📥 Importing database: {db_name}")
            print(f"{'='*60}")
            
            atlas_db = atlas_client[db_name]
            local_db = local_client[db_name]
            
            # Get collections from this database
            collections = atlas_db.list_collection_names()
            print(f"   Collections found: {', '.join(collections)}")
            
            for collection_name in collections:
                print(f"\n   📋 Importing collection: {collection_name}")
                
                try:
                    # Get collection from Atlas and local
                    atlas_collection = atlas_db[collection_name]
                    local_collection = local_db[collection_name]
                    
                    # Count documents
                    doc_count = atlas_collection.count_documents({})
                    print(f"      Total documents: {doc_count}")
                    
                    # Clear existing data in local
                    local_collection.delete_many({})
                    print(f"      ✓ Cleared local collection")
                    
                    # Copy documents from Atlas to local
                    if doc_count > 0:
                        documents = list(atlas_collection.find({}))
                        result = local_collection.insert_many(documents)
                        print(f"      ✓ Inserted {len(result.inserted_ids)} documents")
                    else:
                        print(f"      ℹ️  No documents to import")
                        
                except Exception as e:
                    print(f"      ✗ Error importing {collection_name}: {e}")
        
        print(f"\n{'='*60}")
        print("✅ Import completed successfully!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        atlas_client.close()
        local_client.close()

def main():
    # Get connection string from argument or environment variable
    if len(sys.argv) > 1:
        atlas_uri = sys.argv[1]
    else:
        atlas_uri = os.getenv('ATLAS_URI')
        if not atlas_uri:
            print("❌ Error: MongoDB Atlas connection string not provided")
            print("\nUsage:")
            print("  python import_from_atlas.py <ATLAS_CONNECTION_STRING>")
            print("\nOR set environment variable ATLAS_URI and run:")
            print("  python import_from_atlas.py")
            print("\nExample:")
            print('  python import_from_atlas.py "mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"')
            sys.exit(1)
    
    import_from_atlas(atlas_uri)

if __name__ == '__main__':
    main()
