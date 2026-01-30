import {WebSocket, WebSocketServer} from "ws"
import jwt from 'jsonwebtoken'
import {Server}from 'http'
import http from 'http'
import 'dotenv/config'
import {MessageService} from '../services/msgService'

export const userConnection = new Map<string, any>(); // to store existing connection as kv 


//const server = http.createServer() // this would crete a new http server but we need the server from index.ts 
//const wss = new WebSocketServer({server})

export const setupWebSocket = (server:Server)=>{
    const wss = new WebSocketServer({server})
    wss.on('connection', (ws,req) =>{
        const url = new URL(req.url ||'',`http://${req.headers.host}`)
        const token = url.searchParams.get('token')  //this will search token in query param n returns its val
        if(!token){
            ws.send(JSON.stringify({msg: 'no token provided'}))
            return ws.close()
        }
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string}
            const userId = decoded.userId

            userConnection.set(userId,ws) // saves the connection
            console.log(`User with id ${userId} is connected and the total num of people connected is ${userConnection.size}`)


            //incoming msg from the user to our server from browser client
            ws.on('message',(data)=>{ // this data comes as in binary convert to string then to json
            const msg =  JSON.parse(data.toString())

                // will save this to db and shout to redis intercome 
                const savedMsg = MessageService.handleNewMessage(`${userId}`,msg)
                ws.send(JSON.stringify({type: 'sent'}))


                console.log(`msg from ${userId} `, msg)
            })
            ws.on('close', () => {
                userConnection.delete(userId);
                console.log(`User ${userId} left`)
            })  
        }
        catch(e:any){
            ws.send(JSON.stringify({ error: e.message ||'failed msg' }));
            ws.close();
        }
    })
}

