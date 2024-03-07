import {registerValidationRules} from "../validation";

const express = require('express')
const router = express.Router()


const {
    register,
    getAllUsers,
} = require('../controllers/auth.controller')

router.route('/auth/register').post(registerValidationRules, register)
router.route('/users').get(getAllUsers)


module.exports =  router