require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const workoutRoutes = require('./routes/workouts.js')
const bankingRoutes = require('./routes/banking.js')

// express app
const app = express()

// middleware
const cors = require('cors');
app.use(cors());
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
// TODO Change this to banking stuff once complete
//app.use('/api/workouts', workoutRoutes)
app.use('/api/banking', bankingRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port 4000')
        })
    })
    .catch((error) => {
        console.log(error)
    })
