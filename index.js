import express from "express"
import mongoose from "mongoose"
import Router from "express"
import User from "./models/user.js";
import cors from 'cors'
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";

const DB_URL = 'mongodb://127.0.0.1:27017/dieselMarket';
const LISTEN_PORT = 5000;

const app = express()


app.use(express.json());
app.use(cors());
app.use('/user',userRouter)
app.use('/auth',authRouter)

const itemsRouter = new Router()


export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        return res.json(users)
    } catch (e) {
        console.log(e)
    }
}

itemsRouter.get('/', getUsers)

app.use('/user',itemsRouter)

async function startApp() {
    try {
        await mongoose.connect(DB_URL,{useUnifiedTopology: true, useNewUrlParser: true},(e)=>console.log(e))
        app.listen(LISTEN_PORT, () => console.log('SERVER STARTED ON PORT ' + LISTEN_PORT))

    } catch (e) {
        console.log(e)
    }
}


startApp()