const {conn} = require('../config/db');

// 채널 메인 페이지
exports.channelMain = async (req, res) => {
    const {id} = req.params;
    const {limit, page} = req.query;
    try {
        if (!parseInt(page) || !parseInt(limit)){
            return res.status(400).json({
                message : "잘못된 접근입니다."
            })
        }

        const pageNumber = (N, L) => {
            if (N === 1) {
                return 0
            } else {
                return (N - 1) * L
            }
        }

        const [userChannel] = await conn.query(`
            SELECT
                channels.name,
                channels.description,
                profiles.location AS profileLocation,
                banners.location AS bannerLocation
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
                videoposts.videopost_name AS videopostName,
                videoposts.thumbnail_location AS thumbnailLocation,
                videoposts.video_location AS videoLocation,
                videoposts.running_time AS runningTime,
                videoposts.views,
                videoposts.create_at AS createAt
            FROM videoposts
            LEFT JOIN channels
                ON videoposts.channels_id = channels.id
            WHERE videoposts.channels_id = ?
                ORDER BY videoposts.id DESC
            LIMIT ? OFFSET ?
            `, [id, parseInt(limit), pageNumber(parseInt(page),parseInt(limit))]);
        
        if (userChannel.length > 0){
            return res.status(200).json({
                channel : userChannel[0],
                videoCount : count[0].videoCount,
                subCount : count[0].subCount,
                userVideoposts : userVideopost
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

