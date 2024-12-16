const {conn} = require('../config/db');


// 채널 메인 페이지
exports.channelMain = async (req, res) => {
    const {id} = req.params
    try {
        const [userChannel] = await conn.query(`
            SELECT
                channels.name,
                channels.description,
                profiles.location AS profile_location,
                banners.location AS banners_location
            FROM channels
            LEFT JOIN profiles
                ON channels.id = profiles.channels_id
            LEFT JOIN banners
                ON channels.id = banners.channels_id
            WHERE channels.id = ?
            `, [id]);
        
        const [userVideopost] = await conn.query(`
            SELECT
                channels.name,
                videoposts.videopost_name,
                videoposts.thumbnail_location,
                videoposts.views,
                videoposts.create_at
            FROM videoposts
            LEFT JOIN channels
                ON videoposts.channels_id = channels.id
            WHERE videoposts.channels_id = ?
            `, [id]);
            
        const [subscribers] = await conn.query('SELECT count (*) FROM subscribers WHERE subscribed_id = ?', [id]);
        
        if (userChannel.length > 0){
            return res.status(200).json({
                channel : userChannel[0],
                videoCount : userVideopost.length,
                subscribers : subscribers[0]['count (*)'],
                userVideopost : userVideopost
            })

        } else if (userChannel.length === 0) {
            return res.status(404).json({
                message : "채널이 존재하지 않습니다."
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// 영상 업로드
exports.videopostUpload = async (req, res) => {
    const {id} = req.user;
    const {postname, description} = req.body;

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
                (channels_id, videopost_name, video_location, thumbnail_location,
                description)
            VALUES (?, ?, ?, ?, ?)
            `
        ,[id, postname, videopost[0].location, thumbnail[0].location, description])
        
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