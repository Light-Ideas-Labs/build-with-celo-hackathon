const crypto = require('crypto')
const axios = require("axios")
const fs = require('fs')
const qs = require('qs')

// utils, helper, models, services
const { generateReferenceCode } = require('../utils/utils')

// get jenga access token
const getAccessToken = async () => {
    const token = await axios({
        method: "POST",
        url: 'https://sandbox.jengahq.io/identity/v2/token',
        data: qs.stringify({ 
            username: process.env.JENGA_USERNAME,
            password: process.env.JENGA_PASSWORD
        }),

        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            "Authorization": process.env.JENGA_API_KEY
        }
    })

    console.log("token", token.data.access_token)

    return token.data.access_token
}

// jenga-api signature openssl
const getSignature = async () => {

    const jengaAccountID = `${process.env.COUNTRY_CODE}${process.env.ACCOUNT_ID}`
    
    // 
    const sign = crypto.createSign('SHA256')
    sign.write(jengaAccountID)
    sign.end()

    const privateKey = fs.readFileSync('jenga-api/private.pem')
    console.log("privateKey", privateKey)
    const signature = sign.sign(privateKey, 'base64')
    // console.log("signature", signature)

    return signature
}

// get balance 
const getJengaBalance = async () => {
    let access_token = await getAccessToken()

    let signature = await getSignature()

    const accountBalanceURL = `https://sandbox.jengahq.io/account/v2/account-test/balance/${process.env.COUNTRY_CODE}/${process.env.ACCOUNT_ID}`
    console.log("accountBalanceURL", accountBalanceURL)

    const balance = await axios({
        method: "GET",
        url: accountBalanceURL,
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Signature": signature,
            "Content-Type": "application/json",
        }
    })

    console.log("balance", balance.data)

    return balance.data
}


// receive money deposit 
const receiveMoney = async (phoneNumber, referenceCode, amount) => {
    try {
    let mpesaSTKPushURL = `https://account-test/transaction/v2/payment/mpesastkpush`
    let accessToken = await getAccessToken()
    console.log("accessToken", accessToken)
    let referenceCode = await generateReferenceCode()

    let res = await axios({
        method: "POST",
        url: mpesaSTKPushURL,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        data: {
            "customer": {
                "mobileNumber": "0712380880",
                "countryCode": "KE"
            },
            "transaction": {
                "amount": "100",
                "description": "Gloal Reclic STKPUSH",
                "businessNumber": "915170",
                "reference": referenceCode
            }
        }
    })
    return res.data

} catch(error) {
    console.log("error", error)}
}



module.exports = { getAccessToken, getSignature, getJengaBalance, receiveMoney }