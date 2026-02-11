"""
Database Reset Script
WARNING: This script will DELETE ALL DATA from all collections in the database.
Use this only for development/testing purposes.
"""

from util.dbconn import db

def clear_all_collections():
    """
    Deletes all documents from all collections in the database.
    """
    collections = ['users', 'posts', 'discussions', 'comments', 'tags']
    
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print("Collections to be cleared:")
    for collection_name in collections:
        count = db[collection_name].count_documents({})
        print(f"  - {collection_name}: {count} documents")
    
    confirmation = input("\nType 'DELETE ALL' to confirm: ")
    
    if confirmation != "DELETE ALL":
        print("❌ Operation cancelled.")
        return
    
    print("\n🗑️  Deleting all data...")
    
    for collection_name in collections:
        result = db[collection_name].delete_many({})
        print(f"  ✓ Deleted {result.deleted_count} documents from {collection_name}")
    
    print("\n✅ Database cleared successfully!")
    print("All users will need to re-register and all content is gone.")

if __name__ == "__main__":
    clear_all_collections()
