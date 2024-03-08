import {registerValidationRules} from "../validation";

const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth')

const {
    register,
    signIn,
    getAllUsers,
} = require('../controllers/auth.controller')

router.route('/auth/register').post(registerValidationRules, register)
router.route('/auth/signin').post(signIn)
router.route('/users').get(authMiddleware, getAllUsers)


module.exports =  router