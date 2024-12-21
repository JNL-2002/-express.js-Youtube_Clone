const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();



const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: 'ap-northeast-2'
});

const fileFilter = (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png'];
    const videoTypes = ['video/mp4'];

    if (file.fieldname === 'profile' || file.fieldname === 'banner' || file.fieldname === 'thumbnail') {
        if (imageTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else {
        req.imageUploadFail = "이미지가 아닙니다."
        return cb(null, false)
    }
}

    if (file.fieldname === 'videopost'){
        if (videoTypes.includes(file.mimetype)) {
            return cb(null, true)
        } else {
            req.videoUploadFail = "비디오가 아닙니다."
            return cb(null, false)
        }
    }
    
    }

exports.upload = multer({
    storage : multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const {id} = req.user;
            cb(null, `[user_id: ${id} - ${file.fieldname}]`+ Date.now() + ext);
        }
    }),
    fileFilter : fileFilter
});

// 수정 시 전 사진 삭제
exports.Delete = async (key, url, method) => {
    try {

        if (url === 'v' && (method === 'DELETE' || method === 'PUT')) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket : process.env.AWS_S3_BUCKET,
                Key : key
            })
            const result = await s3.send(deleteCommand);
            return result;
        }

        const checkObj = new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: key
        });

        const date = await s3.send(checkObj);
        
        if (date.KeyCount > 1) {
            const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: date.Contents[0].Key
        });
            await s3.send(deleteCommand);
        }
        return date;
    } catch (err) {
        throw err;
    }
}

