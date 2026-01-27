//this is like listening for messages from other servers
import {Redis} from "ioredis";
import {WebSocket} from 'ws';
import OPEN from 'ws'
const sub = new Redis();
const pub = new Redis();

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

        //find the reciepent in local our map of our sserver 
        const targetSocket = userConnection.get(data.receipientId) 

        if(targetSocket && targetSocket.readyState === WebSocket.OPEN){ // if exist send the msg via the receipient's websocket
            targetSocket.send(JSON.stringify(data.payload))
        }
    })

}
// here pub is publishing to redis intercome
export const pubMessage = (receipientId:string, payload:any) => {
    const message = JSON.stringify(receipientId, payload)
    pub.publish(chatChannel, message)
}
