const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

//Module 5-Video 1: Use express.js middleware to handle cookies (JWT)
server.express.use(cookieParser());

//Module 5-Video 26: Decode the JWT so we can get the JWT on each request
server.express.use((req, res, next) => {
    //1. Pull the token out of the request
    const { token } = req.cookies;

    //2. Decode the token if it is present
    if(token) {
        const { userId } = jwt.verify(token, process.env.APP_SECRET);

        //3. put the userId onto the req for future requests to access
        req.userId = userId;
    }

    //4. Pass it along to the next middleware shalomer
    next();
});

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },
}, deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
});