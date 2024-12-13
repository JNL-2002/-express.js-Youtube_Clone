const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {channelMain} = require('../controllers/channelControllers')
const {videoUpload} = require('../middleware/videoFileMiddleware');
const {imageUpload} = require('../middleware/imageFileMiddleware');

//채널 메인 페이지
router.get('/:id', channelMain);

//영상 업로드,수정,삭제
router.route('/videopost', authMiddleware)
    .post(videoUpload.single('1'), (req, res, next) => {
        console.log(req.file);
        req.videoFile = req.file;
        next();
    }, imageUpload.single('2'), (req, res, next) => {
        console.log(req.file)
        req.tumbnailFile = req.file;
        console.log(
            `비디오 파일 : ${req.videoFile},
            썸네일 파일 : ${req.tumbnailFile}`
        )
    })
    .put()
    .delete()


module.exports = router;
