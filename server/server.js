require("dotenv").config();
const express = require("express")
const app = express();
const {Server} = require("socket.io")
const http = require("http");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: clientUrl,
    credentials: true
}));

app.use(cookieParser());

const server = http.createServer(app);
mongoose.connect("mongodb+srv://digvijaay55_db_user:Fg3lrLbf5RitqjC7@cluster0.0phl3ja.mongodb.net/?appName=Cluster0").then(()=>{
    console.log("MongoDB connected");
}
)



const io = new Server(server, {
    cors: {
        origin: clientUrl,
        credentials: true
    }
});

require("./socket/socket")(io);
app.use(express.json());


app.use("/user", userRoutes);


server.listen(3000, ()=>{
    console.log("Listening to port 3K")
})
