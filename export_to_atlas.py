#!/usr/bin/env python3
"""
Export database from local MongoDB to MongoDB Atlas
Usage: python export_to_atlas.py <ATLAS_CONNECTION_STRING>
Example: python export_to_atlas.py "mongodb+srv://user:password@cluster.mongodb.net/capstone-archive?retryWrites=true&w=majority"
"""

import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def export_to_atlas(atlas_uri, local_uri='mongodb://localhost:27017/'):
    """Export all databases from local MongoDB to MongoDB Atlas"""
    
    print("🔗 Connecting to local MongoDB...")
    local_client = MongoClient(local_uri)
    
    print("🔗 Connecting to MongoDB Atlas...")
    atlas_client = MongoClient(atlas_uri)
    
    try:
        # Get list of databases from local
        local_databases = local_client.list_database_names()
        print(f"\n📊 Found {len(local_databases)} database(s) in local MongoDB:")
        
        for db_name in local_databases:
            if db_name in ['admin', 'config', 'local']:  # Skip system databases
                continue
            
            print(f"\n{'='*60}")
            print(f"📤 Exporting database: {db_name}")
            print(f"{'='*60}")
            
            local_db = local_client[db_name]
            atlas_db = atlas_client[db_name]
            
            # Get collections from this database
            collections = local_db.list_collection_names()
            print(f"   Collections found: {', '.join(collections)}")
            
            for collection_name in collections:
                print(f"\n   📋 Exporting collection: {collection_name}")
                
                try:
                    # Get collection from local and Atlas
                    local_collection = local_db[collection_name]
                    atlas_collection = atlas_db[collection_name]
                    
                    # Count documents
                    doc_count = local_collection.count_documents({})
                    print(f"      Total documents: {doc_count}")
                    
                    # Clear existing data in Atlas
                    atlas_collection.delete_many({})
                    print(f"      ✓ Cleared Atlas collection")
                    
                    # Copy documents from local to Atlas
                    if doc_count > 0:
                        documents = list(local_collection.find({}))
                        result = atlas_collection.insert_many(documents)
                        print(f"      ✓ Inserted {len(result.inserted_ids)} documents")
                    else:
                        print(f"      ℹ️  No documents to export")
                        
                except Exception as e:
                    print(f"      ✗ Error exporting {collection_name}: {e}")
        
        print(f"\n{'='*60}")
        print("✅ Export completed successfully!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        local_client.close()
        atlas_client.close()

def main():
    # Get connection string from argument or environment variable
    if len(sys.argv) > 1:
        atlas_uri = sys.argv[1]
    else:
        atlas_uri = os.getenv('MONGO_URI')
        if not atlas_uri:
            print("❌ Error: MongoDB Atlas connection string not provided")
            print("\nUsage:")
            print("  python export_to_atlas.py <ATLAS_CONNECTION_STRING>")
            print("\nOR set environment variable MONGO_URI and run:")
            print("  python export_to_atlas.py")
            print("\nExample:")
            print('  python export_to_atlas.py "mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"')
            sys.exit(1)
    
    export_to_atlas(atlas_uri)

if __name__ == '__main__':
    main()
