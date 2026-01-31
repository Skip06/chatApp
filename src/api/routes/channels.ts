import {Router} from 'express'
import authenticateToken from '../middleware/jwtAuth'
import prisma from '../../lib/prisma'

const router = Router()

router.post('/create',authenticateToken, async(req: any, res)=>{
    const {name} = req.body
    const creatorId = req.user.userId

    const channel = await prisma.channel.create({
        data: {
            name,
            members: { connect: { id: creatorId } } // link this channel to existing user whose id is creatorId
          }
    })
    res.json(channel)
})


router.post("/join", async (req, res) => {
  const {channelId, userId} = req.body; 

  try{
    const updatedChannel = await prisma.channel.update({
      where: {id: channelId},
      data: {
        members: {
          connect: {id: userId}, // This links the user to the channel in the DB
        },
      },
    });

    res.status(200).json({message: "Joined successfully", updatedChannel});
  }
    catch (error) {
    res.status(500).json({error: "Could not join channel"});
  }
});

export default router