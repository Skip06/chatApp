import 'dotenv/config';
import express from "express";
import http from "http";
import authRoutes from "./api/routes/auth";
import channelRoutes from "./api/routes/channels";
import { setupWebSocket } from "./socket/connection";
import { initPubSub } from "./socket/pubsub";
import { userConnection } from "./socket/connection"; // We will export the Map from there

//everythign is just middleware...


const app = express()
const httpServer = http.createServer(app)

app.use(express.json())

//1st doin the http work
app.use('/auth', authRoutes)
app.use('/channels', channelRoutes)

initPubSub(userConnection); // the intercome layer

setupWebSocket(httpServer); //start the websocket

const port = 3000 ;

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

