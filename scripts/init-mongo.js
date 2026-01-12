// MongoDB Initialization Script
// Run with: mongosh < init-mongo.js

// Switch to polybazar database
use polybazar;

// Create products collection with schema validation
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "category", "price", "sellerId", "status"],
      properties: {
        title: {
          bsonType: "string",
          description: "Product title is required"
        },
        description: {
          bsonType: "string"
        },
        category: {
          bsonType: "string",
          description: "Product category is required"
        },
        type: {
          bsonType: "string"
        },
        grade: {
          bsonType: "string"
        },
        brand: {
          bsonType: "string"
        },
        form: {
          bsonType: "string"
        },
        color: {
          bsonType: "string"
        },
        origin: {
          bsonType: "string"
        },
        price: {
          bsonType: "decimal",
          description: "Product price is required"
        },
        currency: {
          bsonType: "string"
        },
        priceUnit: {
          bsonType: "string"
        },
        minOrderQuantity: {
          bsonType: "decimal"
        },
        availableQuantity: {
          bsonType: "decimal"
        },
        quantityUnit: {
          bsonType: "string"
        },
        images: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        primaryImage: {
          bsonType: "string"
        },
        sellerId: {
          bsonType: "string",
          description: "Seller ID is required"
        },
        sellerName: {
          bsonType: "string"
        },
        sellerCompany: {
          bsonType: "string"
        },
        sellerVerified: {
          bsonType: "bool"
        },
        location: {
          bsonType: "object",
          properties: {
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            country: { bsonType: "string" },
            pincode: { bsonType: "string" },
            coordinates: {
              bsonType: "array",
              items: { bsonType: "double" }
            }
          }
        },
        specs: {
          bsonType: "object"
        },
        status: {
          enum: ["DRAFT", "ACTIVE", "SOLD", "ARCHIVED"],
          description: "Status must be one of: DRAFT, ACTIVE, SOLD, ARCHIVED"
        },
        featured: {
          bsonType: "bool"
        },
        negotiable: {
          bsonType: "bool"
        },
        viewCount: {
          bsonType: "int"
        },
        inquiryCount: {
          bsonType: "int"
        },
        embedding: {
          bsonType: "array",
          items: { bsonType: "double" }
        },
        aiTags: {
          bsonType: "string"
        },
        aiConfidence: {
          bsonType: "double"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// Create indexes for products collection
db.products.createIndex({ title: "text", description: "text" }, { weights: { title: 3, description: 2 } });
db.products.createIndex({ category: 1, type: 1 });
db.products.createIndex({ sellerId: 1, status: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ "location.city": 1 });
db.products.createIndex({ "location.state": 1 });
db.products.createIndex({ "location.coordinates": "2dsphere" });
db.products.createIndex({ createdAt: -1 });
db.products.createIndex({ featured: 1, status: 1 });
db.products.createIndex({ grade: 1 });
db.products.createIndex({ brand: 1 });

// Create chat_messages collection
db.createCollection("chat_messages");

// Create indexes for chat_messages
db.chat_messages.createIndex({ roomId: 1, createdAt: 1 });
db.chat_messages.createIndex({ senderId: 1 });
db.chat_messages.createIndex({ receiverId: 1, read: 1 });
db.chat_messages.createIndex({ "offer.productId": 1, "offer.status": 1 });

// Create chat_rooms collection for tracking conversations
db.createCollection("chat_rooms");
db.chat_rooms.createIndex({ participants: 1 });
db.chat_rooms.createIndex({ productId: 1 });
db.chat_rooms.createIndex({ updatedAt: -1 });

// Create price_history collection for analytics
db.createCollection("price_history");
db.price_history.createIndex({ category: 1, type: 1, date: 1 });
db.price_history.createIndex({ date: 1 });

print("MongoDB initialization complete!");
print("Collections created: products, chat_messages, chat_rooms, price_history");
print("Indexes created successfully");
