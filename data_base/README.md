# Bridging Communication - Database Setup

This folder contains the database initialization script for the "Bridging Communication Gaps" project.

## How to use:
1. Open MongoDB Compass.
2. Connect to your local server.
3. Open the **Mongosh Shell**.
4. Copy and paste the contents of `init-db.js` into the shell and press Enter.

This script will:
- Create the `Bridging_communication` database.
- Set up collections with JSON Schema validation (`users`, `guests`, `signs`, `history`).
- Create necessary indexes.
- Insert initial test data.