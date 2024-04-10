import { check } from 'express-validator'

export const registerValidationRules = [
  check('password')
    .isLength({ min: 2, max: 15 })
    .withMessage('your password should have min and max length between 8-15')
]
