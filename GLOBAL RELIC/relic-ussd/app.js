const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()

// db import 
require('./config/db.config')

const app = express()

const PORT = process.env.PORT || 3000

app.use(morgan('dev'));
app.use(express.json()); 
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())   // cookie parser
app.use(cors())           // enable CORS

const ussdRoute = require('./routes/v1/ussd.route')
const usersRoute = require('./routes/v1/users.route')

// v1 api routes
app.use('/api/v1', usersRoute)

app.use("/ussd-relic", ussdRoute)

// send a 404 error for unkown api request
app.use((req, res, next) => {
    
})


app.listen(PORT, () => {
    console.log(`listening on ${PORT}.`)
})





