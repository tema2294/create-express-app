import Router from "express";

import jwt from "jsonwebtoken"
import User from "../models/user.js";
import {SECRET_KEY} from "../constants.js";
import {roleMiddleware} from "../middlewares/roleMiddleware.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";




const updateUser = async (req, res) => {
    try {
        const {username: oldUserName, newUsername: username, password } = req.body;
        let user;
        const token = req.headers.authorization.split(' ')[1]

        const {id, roles} = jwt.verify(token, SECRET_KEY)

        if (!oldUserName) {
            user = await User.findById(id)
        } else {
            user = await User.findOne({username: oldUserName})
        }

        const isMyUser = id === user?._id.toString()


        if (isMyUser || roles.includes("ADMIN")) {

            const updateUser = await User.findByIdAndUpdate(id, {
                username,
                password,
            }, {new: true})
            return res.json({message: 'success, user was updated', [isMyUser ? 'user' : 'otherUser']: updateUser})
        }
        return res.json({message: "You are don't have permissions"})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'update error',})
    }
}


const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        return res.json(users)
    } catch (e) {
        console.log(e)
    }
}

const getUserInfo = async (req, res) => {
    try {
        const {id} = req.user

        const user = await User.findById(id)

        return res.json(user)
    } catch (e) {
        res.status(400).json({message: 'user not found'})
    }
}


const userRouter = new Router();

userRouter.get('/all-users', roleMiddleware(["ADMIN"]), getUsers)
userRouter.get('/user-info', authMiddleware, getUserInfo)
userRouter.post('/update',updateUser)

export default userRouter