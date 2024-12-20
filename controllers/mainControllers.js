const {conn} = require('../config/db');


// 검색
exports.search = async (req, res) => {
    const {search} = req.query;
    const result = toString(search)
                    .replace(/[^A-za-z0-9-ㄱ-ㅎ-ㅏ-ㅣ-가-힣]/gi, '')
    
}

// 메인 페이지
exports.main = async (req, res) => {
    const {limit, number} = req.query;
    try{
        if (!parseInt(number) || !parseInt(limit)){
            return res.status(400).json({
                message : "잘못된 접근입니다."
            })
        }

        const pageNumber = (N, L) => {
            if (N === 1) {
                return 0
            } else {
                return ((N - 1) * L)
            }
        }

        const [videoPost] = await conn.query(`
            SELECT
                channels.name,
                profiles.location AS profileLocation,
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
            LEFT JOIN profiles
                ON videoposts.channels_id = profiles.channels_id
            ORDER BY videoposts.id DESC
            LIMIT ? OFFSET ?
            `, [parseInt(limit), pageNumber(parseInt(number),parseInt(limit))]);

            if (videoPost.length > 0) {
                return res.status(200).json(videoPost)
            }
            
            return res.status(400).json({
                message : "서버 에러가 발생하였습니다."
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}