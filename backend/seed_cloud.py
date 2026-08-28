"""
Seed a cloud MongoDB (e.g. MongoDB Atlas) with exported local data.

Usage:
    python seed_cloud.py "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/eldercare_ai?retryWrites=true&w=majority"
"""
import os
import sys
import json
from pymongo import MongoClient

def main():
    if len(sys.argv) < 2:
        print("Usage: python seed_cloud.py <MONGODB_URI>")
        print('Example: python seed_cloud.py "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/eldercare_ai"')
        sys.exit(1)

    uri = sys.argv[1]
    client = MongoClient(uri)

    # Extract database name from URI, default to eldercare_ai
    db_name = "eldercare_ai"
    if "/" in uri.split("?")[0].split("mongodb.net")[-1]:
        parsed_db = uri.split("?")[0].split("/")[-1]
        if parsed_db:
            db_name = parsed_db

    db = client[db_name]
    seed_dir = os.path.join(os.path.dirname(__file__), "seed_data")

    if not os.path.isdir(seed_dir):
        print(f"ERROR: seed_data directory not found at {seed_dir}")
        sys.exit(1)

    json_files = [f for f in os.listdir(seed_dir) if f.endswith(".json")]
    if not json_files:
        print("ERROR: No JSON files found in seed_data/")
        sys.exit(1)

    print(f"Connecting to database: {db_name}")
    print(f"Found {len(json_files)} collection files to seed\n")

    total = 0
    for filename in sorted(json_files):
        col_name = filename.replace(".json", "")
        filepath = os.path.join(seed_dir, filename)

        with open(filepath, "r", encoding="utf-8") as f:
            docs = json.load(f)

        if not docs:
            print(f"  SKIP  {col_name} (empty)")
            continue

        collection = db[col_name]

        # Upsert each document using its 'id' field (or 'deviceId'/'patientId' for special collections)
        inserted = 0
        skipped = 0
        for doc in docs:
            # Determine the unique key for this collection
            if "id" in doc:
                key_field = "id"
            elif "deviceId" in doc:
                key_field = "deviceId"
            else:
                # Fallback: insert if no obvious key
                collection.insert_one(doc)
                inserted += 1
                continue

            existing = collection.find_one({key_field: doc[key_field]})
            if existing:
                skipped += 1
            else:
                collection.insert_one(doc)
                inserted += 1

        total += inserted
        print(f"  {col_name}: {inserted} inserted, {skipped} already existed")

    print(f"\nDone! {total} total documents seeded into '{db_name}'.")
    client.close()

if __name__ == "__main__":
    main()
