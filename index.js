const express = require('express');
const Router = require('./Router/UserRoutes')
require('dotenv').config()
const cors = require('cors')

// DataBase
require('./Database')


const server = express();
server.use(cors());
server.use(express.json())

// Routes
server.use('/api/user', Router )

const PORT = process.env.PORT || 8000;
server.listen(PORT, ()=> console.log('listening on port') )