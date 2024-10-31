const express = require('express')
const cors = require('cors')

// initialize the Express.js application
// store it in the app variable
const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// import the dependencies required for dotenv
// the config() function allows for reading of the .env file
const dotenv = require('dotenv').config()
// import the connectDB function created earlier
const connectDB = require('./config/db')

// initialize connection to MongoDB database
connectDB()

// use 8080 as a fallback if PORT is undefined in .env file
const PORT = process.env.PORT || 8088

// configure the Express.js application to run at port 8088
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})

// Test whether api is up
app.get('/', (req, res) => {
  res.json({ message: 'Hello from History Service API!' })
})

module.exports = app