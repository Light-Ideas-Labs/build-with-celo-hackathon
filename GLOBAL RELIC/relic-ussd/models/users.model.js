const mongoose = require('mongoose')
const crypto = require('crypto')
const { v1: uuidv1 } = require('uuid')

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true},
    phoneNumber: { type: String, required: true },
    walletAddress: { type: String, required: true },
    privateKey: { type: String, required: true },
    hashed_password: { type: String, required: true },
    salt: { type: String, },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type : Date, default: Date.now }
})


// 
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: {$ne: excludeUserId}})
    return !!user
}

// virtual field 
userSchema
  .virtual('password')
  .set(function (password){
      this._password = password
      this.salt = uuidv1()
      this.hashed_password = this.encryptPassword(password)
  })
  .get(function(){
      return this._password
  })

  userSchema.methods = {
      // authenticate user method
      authenticate: function(plainText) {
          return this.encryptPassword(plainText) === this.hashed_password
      },

      encryptPassword: function(password) {
          if (!password) return ''
          try {
              return crypto
                 .createHmac('sha1', this.salt)
                 .update(password)
                 .digest('hex')
          } catch (err) {
              return ''
          }
      },
  }


module.exports = mongoose.model('Users', userSchema)