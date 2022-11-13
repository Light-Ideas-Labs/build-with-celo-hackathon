const randomstring = require("randomstring");
const { v4: uuidv4 } = require('uuid');


// trancate wallet address
const truncateWalletAddress = (walletAddress) => {
    return walletAddress.substring(0, 6) + '...' + walletAddress.substring(38, 42);
}

// circle apis Idempotency-Key
const generateIdempotencyKey = () => {
    console.log(uuidv4());
    return uuidv4();
};

// generate reference code
const generateReferenceCode = () => {
    return randomstring.generate({
        length: 12,
        charset: 'numeric'
    });
};

// generate secret code
const generateSecretCode = () => {
    let secret = Math.floor(100000 + Math.random() * 900000);
    return secret;
}

// get time stamp
const getTimeStamp = () => {
    const timestamp = new Date();
    const date = timestamp.getDate();
    const month = timestamp.getMonth() + 1;
    const year = timestamp.getFullYear();
    
    if (date < 10) {
        date = `0${date}`;
    }
    if (month < 10) {
        month = `0${month}`;
    }
    today = `${year}-${month}-${date}`;
    return today;
};



module.exports = { generateIdempotencyKey, truncateWalletAddress, generateReferenceCode, generateSecretCode, getTimeStamp };