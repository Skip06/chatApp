//this is like listening for messages from other servers
import { Redis } from "ioredis";
import {WebSocket} from 'ws';
import prisma from "../lib/prisma";
const sub = new Redis();
const pub = new Redis();
// logic is kki we are looking for a room channel not for a person . if the person is subs
const chatChannel = 'globalChat';  // all servers listens to this same channel

export const initPubSub = (userConnection: Map<string, WebSocket>) => {
    sub.subscribe(chatChannel, (err, count) => {
        if (err) console.error("Failed to subscribe to Redis:", err);
        else {
            console.log(`Subscribed successfully!`);
        }
    })
    sub.on('message', async (channel, message) => {
        console.log(`received msg ${message} from channel ${channel}`);
        const data = JSON.parse(message)
        const { channelId, payload } = data;

        for (const [userId, socket] of userConnection.entries()) { // chking if user is mem of channel
            const isMember = await prisma.channel.findFirst({
                where: {
                    id: channelId,
                    members: { some: { id: userId } }
                }
            })
            if (isMember && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    channelId,
                    payload
                }))
            }
        }



    })


}

export const pubMessage = (channelId:string, payload:any) => { // here pub is publishing to redis intercome
    const message = JSON.stringify({channelId, payload})
    pub.publish(chatChannel, message)
}
