import express from "express";
import { connectToDatabase } from "./services/database.service";
import { gamesRouter as citiesRouter } from "./routes/cities.router";

const app = express();
const port = 8080; // default port to listen

connectToDatabase()
    .then(() => {
        // send all calls to /games to our gamesRouter
        app.use("/cities", citiesRouter);

        // start the Express server
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });
