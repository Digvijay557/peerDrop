require("dotenv").config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const vercelOrigin = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

function allowClientOrigin(origin, callback) {
    if (!origin || clientUrls.includes(origin) || vercelOrigin.test(origin)) {
        callback(null, origin || true);
        return;
    }

    callback(new Error("Origin is not allowed by CORS"));
}

if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
}

app.use(cors({
    origin: allowClientOrigin,
    credentials: true
}));

app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowClientOrigin,
        credentials: true
    }
});

require("./socket/socket")(io);
app.use(express.json());


app.use("/user", userRoutes);

mongoose.connect(mongoUri)
    .then(() => {
        console.log("MongoDB connected");
        server.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
