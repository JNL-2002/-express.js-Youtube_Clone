const {conn} = require('../config/db');

// 채널 메인 페이지
exports.channelMain = async (req, res) => {
    const {id} = req.params;
    try {
     const [count] = await conn.query(`
            SELECT
                (SELECT count(*) FROM videoposts WHERE channels_id = ?) AS videoCount,
                (SELECT count(*) FROM subscribers WHERE subscribed_id = ?) AS subCount
                `, [id,id]);
        
        const [userChannel] = await conn.query(`
            SELECT
                channels.id AS channleId,
                channels.name,
                channels.emali,
                channels.description,
                profiles.location AS profileLocation,
                banners.location AS bannerLocation,
                ? AS videoCount,
                ? AS subscribers
            FROM channels
            LEFT JOIN profiles
                ON channels.id = profiles.channels_id
            LEFT JOIN banners
                ON channels.id = banners.channels_id
            WHERE channels.id = ?
            `, [count[0].videoCount, count[0].subCount, id]);
       
        if (userChannel.length > 0){
            return res.status(200).json(
                userChannel[0]
            )
        } else if (userChannel.length === 0) {
            return res.status(404).json({
                message : "채널이 존재하지 않습니다."
            });
        }

        return res.status(400).json({
            message : "에러가 발생하였습니다."
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}

