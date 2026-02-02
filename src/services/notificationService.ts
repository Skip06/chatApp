import { Svix } from "svix";

const svix = new Svix(process.env.SVIX_AUTH_TOKEN!);

class NotificationService{
    static async sendNewMessageNotification(channelId:string, message:any){
        try{


            await svix.application.getOrCreate({
                name: `Channel-${channelId}`,
                uid: channelId 
            });
            
            await svix.message.create(channelId,{
                eventType: "message.created",
                payload: {
                    id: message.id,
                    content: message.content,
                    sender: message.senderId,
                    channelId: channelId,
                    timestamp: new Date().toISOString()
                }
            })
            console.log(`webhook notification sent for channel ${channelId}`)

        }catch(error){
            console.error("Error sending webhook notification", error)
        }
    }
}

export default NotificationService