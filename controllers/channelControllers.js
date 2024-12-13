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
                videoposts.tumbnail_location,
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
    
}