const express = require('express');
const router = express.Router();
const {channelMain} = require('../controllers/channelControllers');

//채널 메인 페이지 조회
router.get('/:id', channelMain);

module.exports = router;
