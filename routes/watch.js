const express = require('express');
const router = express.Router();
const {getpost} = require('../controllers/watchControllers');

//동영상 (시청 페이지)
router.get('/:videoId', getpost);

module.exports = router;