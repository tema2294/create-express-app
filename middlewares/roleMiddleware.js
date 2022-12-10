import jwt from "jsonwebtoken"
import {SECRET_KEY} from "../constants.js";

export function roleMiddleware (roles) {
    return function (req, res, next) {

        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const token = req.headers.authorization.split(' ')[1]

            if (!token) {
                return res.status(403).json({message: "Пользователь не авторизован"})
            }
            const {roles: userRoles} = jwt.verify(token, SECRET_KEY)

            const hasRole = userRoles.some(role => roles.includes(role));

            if (!hasRole) {
                return res.status(403).json({message: "У вас нет доступа"})
            }

            next();

        } catch (e) {
            console.log(e)
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
    }
}