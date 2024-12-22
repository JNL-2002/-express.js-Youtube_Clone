const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {
    search,
    getPost,
    allPost,
    videopostUpload,
    videopostUpdate,
    videopostDelete
} = require('../controllers/videosControllers');
const {upload} = require('../middleware/FileMiddleware');

// 검색 동영상 조회
router.get('/s', search);

//개별 동영상 조회
router.get('/:videosId', getPost);

//전체 동영상 조회
router.get('/', allPost);

router.route('/v')
    //영상 업로드
    .post(authMiddleware, 
        upload.fields([
                {name : 'thumbnail'},
                {name : 'videopost'}
    ]), videopostUpload)
    //영상 수정
    .put(authMiddleware, upload.single('thumbnail'), videopostUpdate)
    //영상 삭제
    .delete(authMiddleware, videopostDelete)

module.exports = router;