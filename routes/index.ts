import { registerValidationRules } from '../validation'

const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth')

const {
  register,
  signIn
} = require('../controllers/auth.controller')
const {
  getAllUsers,
  me
} = require('../controllers/user.controller')

const {
  create,
  update,
  deleteItem,
  getAllItems,
  getItemsByUser
} = require('../controllers/item.controller')

router.route('/auth/register').post(registerValidationRules, register)
router.route('/auth/signin').post(signIn)
router.route('/users').get(authMiddleware, getAllUsers)
router.route('/me').get(authMiddleware, me)
router.route('/item').post(authMiddleware, create)
router.route('/item/:id').put(authMiddleware, update)
router.route('/item/:id').delete(authMiddleware, deleteItem)
router.route('/items').get(authMiddleware, getAllItems)
router.route('/user-items').get(authMiddleware, getItemsByUser)

module.exports = router
