const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const mainRouter = require('./routes/main');
const channelRouter = require('./routes/channel');
const userRouter = require('./routes/user');
const watchRouter = require('./routes/watch');

// json을 해석하기 위한 것
app.use(express.json());

// cors
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));

// 메인 페이지
app.use('/', mainRouter);
app.use('/watch', watchRouter);
app.use('/channel', channelRouter);
app.use('/user', userRouter);



app.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
})