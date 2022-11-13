const express = require('express')
const { ussdRouter } = require('ussd-router')
const { sendMessage } = require('../../config/at.config')

// import user controller
const { createUser, updateUser, checkUserExists, checkIfVerified, checkUserAddress } = require('../../controllers/users.controller')
const { createWallet, getBalance, transfercUSD, getAccountDetails } = require('../../services/celo-services')
const { getTxIdUrl, } = require('../../services/urls-services')
const { truncateWalletAddress } = require('../../utils/utils')

const router = express.Router()

const { getAccessToken, getJengaBalance, receiveMoney } = require('../../services/jenga-services')

// getAccessToken()
// getJengaBalance()
// receiveMoney()

router.post("/", async(req, res, next) => {
    res.set('Content-Type: text/plain')
    
    const { body: { phoneNumber: phoneNumber, sessionId: sessionId, serviceCode: serviceCode  }} = req
    const { body: { text: rawText } } = req

    const text = ussdRouter(rawText)
    var data = text.split('*')
    const footer = '\n0: Back 00: Home';
    const home = '\n00: Home';
    let msg = ''

    // check if user exists
    const user = await checkUserAddress(phoneNumber)

    if (user.length <= 0) {
        // create wallet before verifing User information 
        const wallet = await createWallet()
        const user = createUser({ firstName: ' ', lastName: ' ', fullName: ' ', phoneNumber: phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey, hashed_password: ' '})
        console.log("user", user)
    } 

    // ToDo: send user an sms with wallet address and private key
    // Your wallet address already exists! \n Please Dial *344# to verify your account

    // check if user is verified
    let isVerified = await checkIfVerified(phoneNumber)
    // user[0].isVerified
    // console.log(isVerified)

    if (!isVerified) {
        // user is not verified
        if (data[0] == null || data[0] == '') {
            msg = `CON Welcome to Global Relic! \n Please enter your details to Verify Account and start using our services.`
            msg += `\nPlease enter your firstName`
            res.send(msg)
            return
        } else if (data[0] !== '' && data[1] == null) {
            msg = `CON Please enter your lastName`
            res.send(msg)
            return
        } else if (data[0] !== '' && data[1] !== '' && data[2] == null) {
            msg = `CON Please enter your password`
            res.send(msg)
            return
        } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] == null) {
            msg = `CON Please confirm your password`
            res.send(msg)
            return
        } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == null) {
            msg = `CON By accessing Global Relic, you agree to the Terms and Conditions and Privacy Policy. Press 1 or 2.`
            msg += `\n1: I agree`
            msg += `\n2: I do not agree`
            res.send(msg)
            return
        } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '1') {
            firstName = data[0]
            lastName = data[1]
            fullName = `${firstName} ${lastName}`

            password = data[2]
            confirmPassword = data[3]

            // check if password and confirm password match
            if (password === confirmPassword && password.length >= 6) {
                console.log(firstName, lastName, password, confirmPassword, fullName)
            
                // get user wallet address to add verified user info
                const userData = await checkUserAddress(phoneNumber)
                const userUpdateObj = { firstName: firstName, lastName: lastName, fullName: fullName, hashed_password: password, isVerified: true}

                // update user details to db
                await updateUser(userData[0]._id, userUpdateObj)
    
                // send user confirmation sms
                let confirmationSms = `Your account has been created successfully! \n Your wallet address is... \n Please dial *344# to access your account.`
                sendMessage(phoneNumber, confirmationSms)
    
                msg =  `END Thank you for Global Relic!`
                msg += `\nYour account will be verified shortly.`
                msg += `\nPlease check your SMS for updates.`
                res.send(msg)
            } else if (password.length < 6) {
                msg = `END Password must be at least 6 characters.`
                msg += `\nPlease try again!!`
                res.send(msg)
                return
            } else if (password !== confirmPassword) {
                msg = `END Password and Confirm Password do not match.`
                msg += `\nPlease try again!!`
                res.send(msg)
                return
            } 
        } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '2') {
            msg = `END Accept the terms & conditions to access Global Relic Services`
            res.send(msg)
        }
    } else if (text === '') {
        msg = `CON Welcome to Global Relic: Choose services you want to view
        1. Trasnfer Funds
        2. Withdraw to M-Pesa
        3. Campaigns Details
        4. My Account Details
        5. Need Help?`
        res.send(msg)
    } 
    // transfer funds - cUSD 1
    else if (data[0] == "1" && data[1] == null ) {
        msg+= `CON please enter your first name to create an account`
        res.send(msg);
    } else if (data[0] == "1" && data[1] !== '') {

        const user = await checkUserAddress(phoneNumber)
        console.log("user details", user)
        
        // checks if the user address is available
        if (user.length <= 0) {
            first_name = data[1]
            const wallet = await createWallet()
            console.log("my name", first_name)
            console.log("wallet created", wallet)

            createUser({ firstName: first_name, phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey })
            msg = `END your wallet address and account created!!!`
            res.send(msg)

        } else {
            msg = "END wallet address already exist!!!"
            res.send(msg)
        }
    } 
    
    // withdraw funds to M-pesa 2
    else if (data[0] == "2" && data[1] == null) {
        msg = `CON Withdraw Ksh from your Relic wallet to M-pesa \n: Enter Amount`
        res.send(msg)
    } else if (data[0] == "2" && data[1] !== '' && data[2] == null) {
        msg = `CON Enter Password`
        res.send(msg) 
    } else if (data[0] == "2" && data[1] !== '' && data[2] !== '' ) {
        const amountToWithdraw = data[1]

        // get user wallet for confirm of withdrawal
        const user = await checkUserAddress(phoneNumber)
        const wallet = truncateWalletAddress(user[0].walletAddress)

        msg = `CON Withdraw ${amountToWithdraw} cUSD from ${wallet} to Phone No: ${phoneNumber}
        1. Accept
        2. Cancel`
        res.send(msg)
    } else if (data[0] == "2" && data[1] !== '' && data[2] == '1') {
        const amountToWithdraw = data[1]
        const password = data[2]
        const user = await checkUserAddress(phoneNumber)
        console.log("user details", user[0].walletAddress)
        // const wallet = await getWallet(user[0].walletAddress, user[0].privateKey)
        // console.log("wallet", wallet)
        // const balance = await getBalance(wallet)
        // console.log("balance", balance)
        // const withdraw = await withdrawToMpesa(wallet, amount, password)
        // console.log("withdraw", withdraw)
        msg = `END Withdrawal of cUSD ${amount} to M-pesa account was successful`
        res.send(msg)
    } else if (data[0] == "2" && data[1] !== '' && data[2] == '2') {
        msg = `END Withdrawal of cUSD ${amount} to M-pesa account was cancelled`
        res.send(msg)
    }

    // campaigns details 3
    else if (data[0] == "3" && data[1] == null) {
       msg = `CON Please enter Amount to Withdraw`
       msg += footer
       res.send(msg)
    } else if (data[0] == '3' && data[1] !== '' && data[2] == null) {
        msg = `CON Please enter your password`
        res.send(msg)
    } else if (data[0] == '3' && data[1] !== '' && data[2] == null) {
        msg = `END We're processing your transaction`
        res.send(msg)
    }
    // account details 4
    else if (data[0] == '4' && data[1] == null){
        msg = `CON select account information you want to view
        1. Account Balance
        2. Account Details
        3. Request Statement
        4. Change Password
        5. Forgot Password` 
        msg += footer
        res.send(msg)
    } else if (data[0] == '4' && data[1] == '1') {
        msg = await getBalance(phoneNumber)
        res.send(msg)
    } else if (data[0] == '4' && data[1] == '2') {
        msg = await getAccountDetails(phoneNumber)
        res.send(msg)
    } else if (data[0] == '4' && data[1] == '3') {
        msg +=`CON Request Statement coming soon`
        res.send(msg)
    } else if (data[0] == '4' && data[1] == '4') {
        msg +=`CON your password`
        res.send(msg)
    } else if (data[0] == '4' && data[1] == '5') {
        msg +=`CON Forgot your password`
        res.send(msg)
    }
    // need help 5
    else if (data[0] == "5" && data[1] == null) {
        msg = `CON Let Us help you
        1. Forgot PIN
        2. Emergency Contact
        3. Learn more about Relic
        3. Report a Problem`
        msg += home
        res.send(msg)
    } 

    next()
})

module.exports = router