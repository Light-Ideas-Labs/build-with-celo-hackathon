const express = require('express')
const router = express.Router()

const { createUser, signUp } = require('../../controllers/users.controller')



router.post('/create/user', createUser)
router.post('/auth/sign-up', signUp)

module.exports = router