const express = require('express');
const router = express.Router();
const {
    login,
    join,
    profileUpload,
    bannerUpload,
    subscriber,
    selectSub,
    deleteSub,
    user
        } = require('../controllers/userControllers');
const {authMiddleware} = require('../middleware/authMiddleware');
const {upload} = require('../middleware/FileMiddleware');

// 회원 조회
router.get('/', authMiddleware, user);

// 로그인
router.get('/login', login);

// 회원가입
router.post('/join', join);

// 프로필 수정
router.put('/profile', authMiddleware, upload.single('profile'), profileUpload);

// 배너 수정
router.put('/banner', authMiddleware, upload.single('banner'), bannerUpload);

// 구독 조회, 추가, 취소
router.route('/sub')
    .get(authMiddleware, selectSub)
    .post(authMiddleware, subscriber)
    .delete(authMiddleware, deleteSub)

module.exports = router;