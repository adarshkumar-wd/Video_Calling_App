import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http"
import { socketInitializer } from "./socket.js";

const app = express();
const port = 3000;

const server = http.createServer(app)

// Initialize the socket server

const io = new Server(server , {
    cors : {
        origin : "*",
        credentials : true
    }
});

// Socket Initializer - Socket code in another File

socketInitializer(io);

// Middlewares for data sharing

app.use(cookieParser());
app.use(cors({
    origin : true,
    credentials : true
}));
app.use(express.json());
app.use(express.urlencoded());

// Listen the server at port 3000

server.listen(port , () => {
    console.log(`Server running at port : ${port}`);
})
