// Africa's Talking API Key Configuration
// ================================

const AT_credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_API_USERNAME
  }
  
const AfricasTalking = require('africastalking')(AT_credentials);

// @param {string} to - The phone number of the recipient
// @param {string} message - The message to be sent
// @param {string} from - The short code of the sender

const sendMessage = async (to, message) => {
    const params = { to: to, message: message, from: 'Relic' }
    try {
      const result = await AfricasTalking.SMS.send(params);
      console.log(result);
      return result;
    } catch(error) {
      console.error(error);
      throw error;
    }
}

// @param {string} to - The phone number of the recipient
// @param {string} message - The message to be sent
// @param {string} bulkSMSMode - The mode of sending the message
// @param {string} keyword - The keyword used to send the message


module.exports = { sendMessage }