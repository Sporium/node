import {registerValidationRules} from "../validation";

const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth')

const {
    register,
    signIn,
    getAllUsers,
} = require('../controllers/auth.controller')

const {
    create,
    getAllItems,
    getItemsByUser,
} = require('../controllers/item.controller')

router.route('/auth/register').post(registerValidationRules, register)
router.route('/auth/signin').post(signIn)
router.route('/users').get(authMiddleware, getAllUsers)
router.route('/item').post(authMiddleware, create)
router.route('/items').get(authMiddleware, getAllItems)
router.route('/user-items').get(authMiddleware, getItemsByUser)


module.exports =  router