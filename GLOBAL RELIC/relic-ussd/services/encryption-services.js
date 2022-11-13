const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const key = crypto.randomBytes(32); // generate a random key
const iv = crypto.randomBytes(16); // generate and initialize random iv

const encrypt = (data) => {
    let cipherData = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipherData.update(data);
  
    encrypted = Buffer.concat([encrypted, cipherData.final()]);
  
    const payload = {
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex"),
    };
  
    // create a token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "9m" });
    return token;
  };
  
  const decrypt = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
  
    let iv = Buffer.from(payload.iv, "hex");
    let encryptedData = Buffer.from(payload.encryptedData, "hex");
  
    // decrypt the data
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedData);
  
    decrypted = Buffer.concat([decrypted, decipher.final()]);
  
    return decrypted.toString();
  };
  
  
  module.exports = { encrypt, decrypt };