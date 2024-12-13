const express = require('express');
const router = express.Router();
const {
    login,
    join,
    profileUpload,
    bannerUpload,
    subscriber,
    deleteSub
        } = require('../controllers/userControllers');
const {authMiddleware} = require('../middleware/authMiddleware');
const {imageUpload} = require('../middleware/imageFileMiddleware');


// 로그인
router.get('/login', login);

// 회원가입
router.post('/join', join);

// 프로필 수정
router.put('/profile', authMiddleware, imageUpload.single('profile'), profileUpload);

// 배너 수정
router.put('/banner', authMiddleware, imageUpload.single('banner'), bannerUpload);

// 구독 추가, 취소
router.route('/sub', authMiddleware)
    .post(subscriber)
    .delete(deleteSub)

module.exports = router;