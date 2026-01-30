//this is like listening for messages from other servers
import {Redis} from "ioredis";
import {WebSocket} from 'ws';
import OPEN from 'ws'
const sub = new Redis();
const pub = new Redis();
// logic is kki we are looking for a room channel not for a person . if the person is subs
const chatChannel = 'globalChat';  // all servers listens to this same channel

export const initPubSub = (userConnection: Map<string, WebSocket>)=>{
    sub.subscribe('chatChannel',(err, count) => {
        if (err) console.error("Failed to subscribe to Redis:", err);
        else {
            console.log(`Subscribed successfully!`);
        }
    })
    sub.on('message',(channel, message)=>{
        console.log(`received msg ${message} from channel ${channel}`);
        const data = JSON.parse(message)
        const { channelId, payload } = data;

    //     //find the reciepent in local our map of our sserver 
    //     const targetSocket = userConnection.get(data.receipientId) 

    //     if(targetSocket && targetSocket.readyState === WebSocket.OPEN){ // if exist send the msg via the receipient's websocket
    //         targetSocket.send(JSON.stringify(data.payload))
    //     }

    userConnection.forEach((socket, userId) => {
        // In a real app, you'd check: Is this userId a member of channelId?
        // For now, let's broadcast to all active pipes to see it working
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "NEW_MESSAGE",
                channelId: channelId,
                payload: payload
            }));
        }
    });

    })


}
// here pub is publishing to redis intercome
export const pubMessage = (receipientId:string, payload:any) => {
    const message = JSON.stringify(receipientId, payload)
    pub.publish(chatChannel, message)
}
