const multer = require('multer');
const path = require('path');


const fileFilter = (req, file, cb) => {
    const Types = ['video/mp4'];
    
    if (Types.includes(file.mimetype)) {
        return cb(null, true)
    }

    req.videoUploadFail = '영상이 아닙니다.';
    return cb(null, false);
}

exports.videoUpload = multer({
    storage : multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'videos/')
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + Date.now() + ext);
        }
    }),
    fileFilter : fileFilter
})
