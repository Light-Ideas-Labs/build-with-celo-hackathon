const User = require('../models/users.model')
const { getUserById } = require('../services/user.services')


exports.signUp = async (req, res, next) => {

    const { phoneNumber, walletAddress, privateKey } = req.body

    // check if phoneNumber already exists
    const user = await User.findOne({phoneNumber})
    if(user) {
        return res.status(400).json({
            error: `User with this ${phoneNumber} already exists!`
        })
    }

    const newUser = new User({phoneNumber, walletAddress, privateKey})

    newUser.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }

        user.firstName = ' '
        user.salt = undefined
        user.hashed_password= undefined

        res.status(200).json({
            data: user,
            message: 'User succesfuly created'
        })
    })
}

// @function create user
// @param {Object} req - request object
// @param {Object} res - response object
// @return {Object} - response object

exports.createUser = ({ firstName, lastName, fullName, phoneNumber, walletAddress, privateKey, hashed_password }) => {
    try {

        const newUser = new User({ firstName, lastName, fullName, phoneNumber, walletAddress, privateKey, hashed_password })
        
        newUser.save((error, user) => {

            console.log(error)
        })
    } catch(error) {
        console.log(error)
    }
}

exports.checkIfVerified = async(phoneNumber) => {
    try {
        const user =  await User.find({ phoneNumber })
        if (user[0].isVerified === true) {
            available = true
            return (available)
        } else {
            available = false
            return (available)
        }
    } catch(error) {
        available = false
        return (available)
    }
}

exports.checkUserAddress = async(phoneNumber) => {
    try {
        const user =  await User.find({ phoneNumber })

        if (!user) {
            message = 'User not found'
            return message
        }

        return user

    } catch(error){
        console.log(error, "User not available!!")
    }
}

// updated user info
exports.updateUser = async(userId, updateBody) => {
    try {
        const query = { _id: userId }
        const user = await getUserById(query)

        if(!user) {
            message = 'User not found'
            return message
        }

        Object.assign(user, updateBody)
        await user.save()
        return user

    } catch (error) {
        console.log(error, "User not available!!")
    }
}

exports.checkUserExists = async(phoneNumber) => {
    try {
        const user =  await User.find({ phoneNumber })
        // console.log(user[0].isVerified)
        if (user) {
            available = true
            return (available)
        } else {
            available = false
            return (available)
        }
    } catch(error) {
        available = false
        return (available)
    }
}




