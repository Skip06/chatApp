import {z} from 'zod'
import prisma from '../lib/prisma'
import {pubMessage} from '../socket/pubsub'
import NotificationService from './notificationService'

const msgSchema = z.object({
    content: z.string().min(3).max(100),
    channelId: z.uuid()
})

export class MessageService{
    static async handleNewMessage(userId:string, rawData:any ){ //no need to create obj as its static
        const {content, channelId} = msgSchema.parse(rawData)  //zod cheks the schema

        //now should store in supabase 

        const savedMsg = await prisma.message.create({
            data:{
                content,
                channelId,
                userId
            },
            include:{  // fetching the username also so that frontend doesnot make another api call to get username
                user:{
                    select:{ username: true }              // while fetching include username
                        
                }
            }
        })
        await NotificationService.sendNewMessageNotification(savedMsg.channelId, savedMsg);
        pubMessage(channelId,savedMsg) //now just publishsing
        return savedMsg;


    }
}