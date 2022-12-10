import {Router} from "express";
import {check, validationResult} from "express-validator";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import {SECRET_KEY} from "../constants.js";
import Role from "../models/role.js";
import bcrypt from 'bcrypt'

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, SECRET_KEY, {expiresIn: "5d"} )
}


const registration = async (req, res) => {
    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Ошибка при регистрации", errors})
        }
        const {username, password} = req.body;
        const candidate = await User.findOne({username})
        if (candidate) {
            return res.status(400).json({message: "Пользователь с таким именем уже существует"})
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        const userRole = await Role.findOne({value: "USER"})
        console.log(userRole)
        const user = new User({username, password: hashPassword, roles: [userRole.value]})
        await user.save()
        return res.json({message: "Пользователь успешно зарегистрирован"})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Registration error'})
    }
}

const login = async (req, res) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({message: `Пользователь ${username} не найден`})
        }
        const validPassword = bcrypt.compareSync(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: `Введен неверный пароль`})
        }
        const token = generateAccessToken(user._id, user.roles)

        return res.json({token,user})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Login error'})
    }
}


const authRouter = new Router()

authRouter.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 10 символов").isLength({min:4, max:10})
], registration)

authRouter.post('/login', login)

export default authRouter