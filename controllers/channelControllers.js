const {conn} = require('../config/db');
const {Delete} = require('../middleware/FileMiddleware');

// 채널 메인 페이지
exports.channelMain = async (req, res) => {
    const {id} = req.params;
    const {number} = req.query;
    try {
        if (!parseInt(number)){
            return res.status(400).json({
                message : "잘못된 접근입니다."
            })
        }

        const pageNumber = (N) => {
            if (N === 1) {
                return 0
            } else {
                return (N - 1) * 25 
            }
        }

        const [userChannel] = await conn.query(`
            SELECT
                channels.name,
                channels.description,
                profiles.location AS profile_location,
                banners.location AS banner_location
            FROM channels
            LEFT JOIN profiles
                ON channels.id = profiles.channels_id
            LEFT JOIN banners
                ON channels.id = banners.channels_id
            WHERE channels.id = ?
            `, [id]);

        const [count] = await conn.query(`
            SELECT
                (SELECT count(*) FROM videoposts WHERE channels_id = ?) AS videoCount,
                (SELECT count(*) FROM subscribers WHERE subscribed_id = ?) AS subCount
                `, [id,id]);

        const [userVideopost] = await conn.query(`
            SELECT
                channels.name,
                videoposts.id,
                videoposts.videopost_name,
                videoposts.thumbnail_location,
                videoposts.running_time,
                videoposts.views,
                videoposts.create_at
            FROM videoposts
            LEFT JOIN channels
                ON videoposts.channels_id = channels.id
            WHERE videoposts.channels_id = ?
                ORDER BY videoposts.id DESC
            LIMIT 25 OFFSET ?
            `, [id,pageNumber(parseInt(number))]);
        
        if (userChannel.length > 0){
            return res.status(200).json({
                channel : userChannel[0],
                videoCount : count[0].videoCount,
                subscribers : count[0].subCount,
                userVideopost : userVideopost
            })
        } else if (userChannel.length === 0) {
            return res.status(404).json({
                message : "채널이 존재하지 않습니다."
            });
        }

        return res.status(400).json({
            message : "에러가 발생하였습니다."
        })
    } catch (err) {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}

// 영상 업로드
exports.videopostUpload = async (req, res) => {
    const {id} = req.user;
    const {postName, runningTime ,description} = req.body;

    if (req.videoUploadFail || req.imageUploadFail) {
        return res.status(404).json({
            message : "영상 또는 이미지가 아닙니다."
        })
    }
    const {thumbnail, videopost} = req.files;
    try {

        const [videoPost] = await conn.query(`
            INSERT
            INTO videoposts
                (channels_id, videopost_name, video_location, thumbnail_location, running_time,
                description)
            VALUES (?, ?, ?, ?, ?, ?)
            `
        ,[id, postName, videopost[0].location, thumbnail[0].location, runningTime, description]);
        
        if (videoPost.affectedRows > 0) { 
            return res.status(201).json({
                message : "업로드가 완료되었습니다."
            });
        }

        return res.status(400).json({
            message : "업로드 중 에러가 발생하였습니다."
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}

// 영상 수정
exports.videopostUpdate = async (req, res) => {
    const {id} = req.user;
    const {postName, description} = req.body;
    const {videopostId} = req.params;

    if (req.imageUploadFail) {
        return res.status(404).json({
            message : "이미지가 아닙니다."
        })
    }

    try {
    // 썸네일을 수정하지 않은 경우
    if (!req.file) {
        const [updatePost] = await conn.query(`
                UPDATE videoposts
                    SET videopost_name = ?, description = ?
                    WHERE id = ? AND channels_id = ?
            `,[postName, description, videopostId, id]);

            if (updatePost.affectedRows > 0) {
                return res.status(201).json({
                    message : "수정이 완료되었습니다."
                })
            } else {
                return res.status(400).json({
                    message : "에러가 발생하였습니다."
                })
            }
    }

    // 썸네일 까지 수정한 경우
    const {location} = req.file
    const [updatePost] = await conn.query(`
            UPDATE videoposts
                    SET videopost_name = ?, thumbnail_location = ? ,
                        description = ?
                    WHERE id = ? AND channels_id = ?
        `,[postName, location, description, videopostId, id]);
        if (updatePost.affectedRows > 0) {
            return res.status(201).json({
                message : "수정이 완료되었습니다."
            })
        } else {
            return res.status(400).json({
                message : "에러가 발생하였습니다."
            })
        }
    } catch {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}


// 영상 삭제
exports.videopostDelete = async (req, res) => {
    const {id} = req.user;
    const {videopostId} = req.params
    
    try {
    // 비디오 삭제
    const [videopostLocation] = await conn.query(`
        SELECT video_location, thumbnail_location
            FROM videoposts
        WHERE id = ? AND channels_id = ?
        `,[videopostId,id]);

        if (videopostLocation.length > 0){
        const videoUrl = new URL(videopostLocation[0].video_location).pathname;
        const thumbnailUrl = new URL(videopostLocation[0].thumbnail_location).pathname;

        const decoded = (url) => {
            const index = url.indexOf('%5D') + 3;
            const result = url.substring(index);
            return result;
        }

            await Delete(`[user_id: ${id} - videopost]${decoded(videoUrl)}`, req.url.split('/')[1], req.method);
            await Delete(`[user_id: ${id} - thumbnail]${decoded(thumbnailUrl)}`, req.url.split('/')[1], req.method);
            
            const [deletePost] = await conn.query(`
                DELETE FROM videoposts WHERE id = ? AND channels_id = ?
                `, [id, videopostId]);

            if (deletePost.affectedRows > 0) {
                return res.status(200).json({
                    message : "성공적으로 삭제되었습니다."
                })
            } else {
                return res.status(400).json({
                    message : "에러가 발생하였습니다."
                })
            }
        }

        return res.status(400).json({
            message : "동영상이 존재하지 않습니다."
        })
    } catch {
        res.status(500).json({
            error : "서버에러가 발생하였습니다."
        })
    }
}