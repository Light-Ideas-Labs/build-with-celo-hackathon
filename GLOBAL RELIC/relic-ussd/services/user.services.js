const User = require('../models/users.model')


// Create a user
const createUser = async (userBody) => {
    // if (await User.isEmaiTaken(userBody))
}



/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

 const getUserById = async (id) => {
    return User.findById(id)
}

module.exports = { createUser, getUserById }