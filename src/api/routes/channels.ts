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

export default router