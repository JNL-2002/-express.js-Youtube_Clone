const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const channelRouter = require('./routes/channel');
const userRouter = require('./routes/user');
const videosRouter = require('./routes/videos');

// json을 해석하기 위한 것
app.use(express.json());

// cors
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));


app.use('/videos', videosRouter);
app.use('/channel', channelRouter);
app.use('/user', userRouter);



app.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
})