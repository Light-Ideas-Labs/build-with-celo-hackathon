const ContractKit = require('@celo/contractkit')
const bip39 = require('bip39')
const kit = ContractKit.newKit(process.env.TEST_NET_ALFAJORES)
const mnemonic = bip39.generateMnemonic()

// 
const { checkUserAddress } = require('../controllers/users.controller')
const { truncateWalletAddress } = require('../utils/utils')

// convert from wei
const convertFromWei = async(value) => {
    return kit.web3.utils.fromWei(value.toString(), 'ether')
}

// generate mnemonic
const generateMnemonic = async(mnemonic) => {
    return mnemonic
}


// create wallet 
const createWallet = async() => {
    try {
        const wallet = kit.web3.eth.accounts.create()

        return wallet
    } catch(error) {

        console.log(error)
    }
}

//  get balance
const getBalance = async(userMSISDN) => {
    console.log("user phone number", userMSISDN)
    try {
        const user = await checkUserAddress(userMSISDN)
        let walletAddress = user[0].walletAddress

        // get celo balance 
        const celoTokenWrapper = await kit.contracts.getGoldToken()
        let celoBalance = await celoTokenWrapper.balanceOf(walletAddress)
        celoBalance = kit.web3.utils.fromWei(celoBalance.toString(), 'ether')

        // get cUSD balance
        const cusdTokenWrapper = await kit.contracts.getStableToken()
        let cusdBalance = await cusdTokenWrapper.balanceOf(walletAddress) // if 100000000000000000000 celo = 1
        cusdBalance = kit.web3.utils.fromWei(cusdBalance.toString(), 'ether')

        // get cEUR balance
        const ceurTokenWrapper = await kit.contracts.getStableToken("cEUR")
        let ceurBalance = await ceurTokenWrapper.balanceOf(walletAddress)
        ceurBalance = kit.web3.utils.fromWei(ceurBalance.toString(), 'ether')

        // get total balance
        const balanceTotal = await kit.web3.eth.getBalance(walletAddress)
        let totalBalance = await kit.getTotalBalance(walletAddress)
        const lockedCelo = totalBalance.lockedCELO
        let celoLocked = kit.web3.utils.fromWei(lockedCelo.toString(), 'ether')

        console.log("Total balance", celoLocked)



        return `END Celo Balance: ${celoBalance} \n cUSD Balance: ${cusdBalance} \ncEUR Balance: ${ceurBalance}`

        // return `END Your account Balance is: CELO: ${celoBalance} cUSD: ${cusdBalance} cEUR: ${ceurBalance}`

    } catch (error) {


        console.log(error)
    }
}

// getting account details
const getAccountDetails = async(userMSISDN) => {
    const user = await checkUserAddress(userMSISDN)

    const accountAddress = truncateWalletAddress(user[0].walletAddress)
    const userName = user[0].firstName + " " + user[0].lastName

    return `END Name: ${userName} \n Phone No: ${userMSISDN} \nWallet address: ${accountAddress}`
}

// 

// transfer celo
const sendcUSD = async(sender, receiver, amount, privatekey) => {
    const weiTransferAmount = kit.web3.utils.toWei(amount.toString(), 'ether')
    // cusd wrapper to check if the user has enough balance
    const stableTokenWrapper = await kit.contracts.getStableToken()
    
    const senderBalance = await stableTokenWrapper.balanceOf(sender)

    if (amount > senderBalance) {
        console.log(`You don't have enough funds to fulfil request: ${ await convertFromWei(senderBalance)}`)
        return 'failed'
    }
    console.info(
        `Sender balance of ${ await convertFromWei(senderBalance)} cUSD is Sufficient to fulfil ${ await convertFromWei(weiTransferAmount)} cUSD`
    )
    
    kit.addAccount(privatekey)
    const stableTokenContract = await kit._web3Contracts.getStableToken()
    const txObject = await stableTokenContract.methods.transfer(receiver, weiTransferAmount)
    const tx = await kit.sendTransactionObject(txObject, {from: sender})

    const hash = await tx.getHash()

    console.log("tx details", tx)
    console.info(`Transferred ${amount} dollars to ${receiver}. Hash: ${hash}`);

    return hash
} 


const transfercUSD = async (senderId, recipientId, amount) => {
    try {
    const user = await checkUserAddress(senderId)

    let senderInfo = user[0].walletAddress
    let senderKey = user[0].privateKey

    const userDoc = await checkUserAddress(recipientId)
    let receiverInfo = userDoc[0].walletAddress

    let cusdAmount = amount * 0.01

    return sendcUSD( `${senderInfo}`, `${receiverInfo}`, cusdAmount, senderKey)
    } catch (error) {

        console.log(error)
    }
}

// buy celo
const buyCelo = async (sender, ) => {

}

module.exports = { createWallet, getBalance, transfercUSD, getAccountDetails }