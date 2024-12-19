const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {search} =require('../controllers/mainControllers');

//메인 페이지
router.get('/',);

//검색 페이지
router.get('/results', search);

//구독한 사람 보이는 페이지
router.get('/sub', authMiddleware, );

//시청한 영상 보이는 페이지
router.get('/history', authMiddleware, );

module.exports = router;
