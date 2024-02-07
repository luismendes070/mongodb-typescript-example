import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import City from "../models/city";

export const collections: { games?: mongoDB.Collection<City> } = {};

export async function connectToDatabase() {
    // Pulls in the .env file so it can be accessed from process.env. No path as .env is in root, the default location
    dotenv.config();

    // Create a new MongoDB client with the connection string from .env
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

    // Connect to the cluster
    await client.connect();

    // Connect to the database with the name specified in .env
    const db = client.db(process.env.DB_NAME);
    
    // Apply schema validation to the collection
    await applySchemaValidation(db);

    // Connect to the collection with the specific name from .env, found in the database previously specified
    const gamesCollection = db.collection<City>(process.env.GAMES_COLLECTION_NAME);

    // Persist the connection to the Games collection
    collections.games = gamesCollection;

    console.log(
        `Successfully connected to database: ${db.databaseName} and collection: ${gamesCollection.collectionName}`,
    );
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Game model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["city", "state_id", "state_name"],
            additionalProperties: false,
            properties: {
                _id: {},
                city: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                state_id: {
                    bsonType: "string",
                    description: "'sate_id' is required and is a string",
                },
                state_name: {
                    bsonType: "string",
                    description: "'state' is required and is a string",
                },
            },
        },
    };

    // Try applying the modification to the collection, if the collection doesn't exist, create it 
   await db.command({
        collMod: process.env.GAMES_COLLECTION_NAME,
        validator: jsonSchema
    }).catch(async (error: mongoDB.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection(process.env.GAMES_COLLECTION_NAME, {validator: jsonSchema});
        }
    });
}
