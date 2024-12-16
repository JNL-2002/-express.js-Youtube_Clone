const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {
    channelMain,
    videopostUpload,
    videopostUpdate
} = require('../controllers/channelControllers');
const {upload} = require('../middleware/FileMiddleware');

//채널 메인 페이지
router.get('/:id', channelMain);

//영상 업로드,수정,삭제
router.post('/videopost', authMiddleware, upload.fields([
    {name : 'thumbnail'},
    {name : 'videopost'}
]), videopostUpload);

router.route('/videopost/:videopostId')
    .put(authMiddleware, upload.single('thumbnail'), videopostUpdate)
    .delete()


module.exports = router;
