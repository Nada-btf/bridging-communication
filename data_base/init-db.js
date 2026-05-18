// ==========================================
// Database Initialization: Bridging_communication
// Graduation Project (PFE) - Computer Science
// ==========================================

use("Bridging_communication");

// 1. Reset Collections
db.users.drop();
db.guests.drop();
db.signs.drop();
db.history.drop();
db.notifications.drop();

// 2. Create Users Collection with Validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "password", "username", "userType", "isBlocked", "createdAt"],
      properties: {
        firstName:    { bsonType: "string" },
        lastName:     { bsonType: "string" },
        email:        { bsonType: "string" },
        password:     { bsonType: "string" },
        username:     { bsonType: "string" },
        userType:     { bsonType: "string", enum: ["deaf", "hearing", "admin"] },
        isBlocked:    { bsonType: "bool" },
        createdAt:    { bsonType: "date" },
        updatedAt:    { bsonType: "date" },
        deafProfile: {
          bsonType: "object",
          properties: { deafID: { bsonType: "int" }, preferences: { bsonType: "object" } }
        },
        hearingProfile: {
          bsonType: "object",
          properties: { hearingID: { bsonType: "int" }, preferences: { bsonType: "object" } }
        },
        adminProfile: {
          bsonType: "object",
          properties: {
            adminID:     { bsonType: "int" },
            permissions: { bsonType: "array", items: { bsonType: "string" } }
          }
        }
      }
    }
  },
  validationAction: "warn"
});

// Indexes for Users
db.users.createIndex({ email: 1 },    { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// 3. Create Guests Collection
db.createCollection("guests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionToken", "createdAt"],
      properties: {
        sessionToken: { bsonType: "string" },
        createdAt:    { bsonType: "date" },
        expiresAt:    { bsonType: "date" }
      }
    }
  }
});
db.guests.createIndex({ expiresAt: 1 },      { expireAfterSeconds: 0 });
db.guests.createIndex({ sessionToken: 1 },   { unique: true });

// 4. Create Signs Collection
db.createCollection("signs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["gesture", "meaning", "adminId", "createdAt"],
      properties: {
        gesture:    { bsonType: "string" },
        meaning:    { bsonType: "string" },
        videoURL:   { bsonType: "string" },
        category:   { bsonType: "string" },
        adminId:    { bsonType: "objectId" },
        createdAt:  { bsonType: "date" },
        updatedAt:  { bsonType: "date" },
        tags:       { bsonType: "array", items: { bsonType: "string" } }
      }
    }
  }
});
db.signs.createIndex({ gesture: 1 }, { unique: true });

// 5. Create History Collection
db.createCollection("history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["historyId", "fileId", "userId", "inputType", "result", "translatedAt", "file"],
      properties: {
        historyId:   { bsonType: "int" },
        fileId:      { bsonType: "int" },
        userId:      { bsonType: "int" },
        // receiverId links to the other participant in a two-party communication session
        receiverId:  { bsonType: ["int", "null"] },
        inputType:   { bsonType: "string", enum: ["sign-to-speech", "speech-to-sign"] },
        result:      { bsonType: "string" },
        isFavorite:  { bsonType: "bool" },
        translatedAt: { bsonType: "date" },
        file: {
          bsonType: "object",
          required: ["fileName", "fileType", "uploadedAt"],
          properties: {
            fileName:    { bsonType: "string" },
            fileType:    { bsonType: "string" },
            fileContent: { bsonType: "string" },
            uploadedAt:  { bsonType: "date" }
          }
        }
      }
    }
  }
});

// Performance indexes for history
db.history.createIndex({ historyId: 1, fileId: 1 }, { unique: true });
db.history.createIndex({ userId: 1 });                 // fast per-user queries
db.history.createIndex({ userId: 1, translatedAt: -1 }); // fast filtered + sorted queries

// 6. Create Notifications Collection
db.createCollection("notifications");
db.notifications.createIndex({ userId: 1, createdAt: -1 });

// 7. Seed Initial Data
const adminResult = db.users.insertOne({
  firstName: "Imene",
  lastName:  "Bouleghlimat",
  email:     "admin@bridging.dz",
  password:  "hashed_admin_password",
  username:  "superadmin",
  userType:  "admin",
  isBlocked: false,
  createdAt: new Date(),
  adminProfile: { adminID: 1, permissions: ["manage_signs", "manage_users"] }
});

const adminId = adminResult.insertedId;

db.users.insertOne({
  firstName: "Nada",
  lastName:  "Boutaf",
  email:     "nada@example.dz",
  password:  "hashed_password",
  username:  "nada_btf",
  userType:  "deaf",
  isBlocked: false,
  createdAt: new Date(),
  deafProfile: { deafID: 1, preferences: { theme: "dark" } }
});

db.signs.insertMany([
  { gesture: "HELLO",   meaning: "Hello",     category: "Greeting", adminId: adminId, createdAt: new Date() },
  { gesture: "THANKYOU", meaning: "Thank you", category: "Emotion",  adminId: adminId, createdAt: new Date() }
]);

print("Database 'Bridging_communication' initialized successfully.");