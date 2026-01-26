//It uses Zod to validate that the user actually sends an email and password before we even touch the database.
import {Router} from 'express'
import {z} from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../../lib/prisma'

const router = Router()

const signUpSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.email(),
    password: z.string()
})

const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})

router.post('/signup', async(req,res) => {
    try{
        const {username, password, email} = signUpSchema.parse(req.body)
        const hashedPass = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data:{
                username,
                email,
                password: hashedPass
            }
        })
        res.status(201).json({
            msg: 'user created',
            userid: user.id
        })
    }
    catch(e){
        res.status(400).json({
            error: e,
            msg: 'Signup Failed'
        })
    }
})

router.post('/login', async(req,res) => {
    try{
        const {email, password} = loginSchema.parse(req.body)

        const user = await prisma.user.findUnique({where: {email}})
        if(!user) return res.status(400).json({msg: 'No user exist'})

        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) return res.status(401).json({error: "wrong pass"});

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!)
        res.json({
            token ,username: user.username
        })
    }
    catch(e){
        res.status(400).json({
            msg: 'login Failed'
        })
    }
})

export default router