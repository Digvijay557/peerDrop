require("dotenv").config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Comma-separated list of allowed frontend origins, e.g.
// CLIENT_URL=https://peerdrop.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", service: "peerdrop-server" });
});

app.use("/user", userRoutes);

const server = http.createServer(app);

if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to your environment variables.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });

const io = new Server(server, {
    cors: corsOptions
});

require("./socket/socket")(io);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
