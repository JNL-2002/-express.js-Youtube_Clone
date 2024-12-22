const {conn} = require('../config/db');
const {Delete} = require('../middleware/FileMiddleware');
// const {search} = require('../middleware/searchMiddleware');

// 검색 동영상 조회
exports.search = async (req, res) => {
    const {search_query, limit, page} = req.query;

    const result = search_query.replace(/[^\w\s가-힣]/g, '');
    //const dNumber = result.replace(/\d+/g, "");
        try {
        if (!parseInt(page) || !parseInt(limit)){
            return res.status(400).json({
                message : "잘못된 접근입니다."
            })
        }
            
        // const searchdata = await search(dNumber);

            const pageNumber = (N, L) => {
            if (N === 1) {
                return 0
            } else {
                return ((N - 1) * L)
            }
        }
    
        // 띄워쓰기 기준 모든 문장이 일치하는 경우
        const [firstSearch] = await conn.query(`
            SELECT
                channels.id AS channelId,
                channels.name,
                videoposts.id AS videopostId,
                videoposts.videopost_name AS videopostName,
                videoposts.thumbnail_location AS thumbnailLocation,
                videoposts.video_location AS videoLocation,
                videoposts.views,
                videoposts.create_at AS createAt,
                videoposts.running_time AS runningTime
            FROM videoposts
            LEFT JOIN channels
                ON videoposts.channels_id = channels.id
            WHERE
            MATCH(videoposts.videopost_name, videoposts.description)
            AGAINST(?)
            LIMIT ? OFFSET ?
            `, [result, parseInt(limit), pageNumber(parseInt(page),parseInt(limit))])

            const NextPage = Math.ceil(firstSearch.length / limit) === page ? false : true
            
            if (firstSearch.length > 0) {
                return res.status(200).json({
                    videos : firstSearch,
                    meta : {
                        currentPage : page,
                        hasNextPage : NextPage
                        }
                })
            } else if (firstSearch.length == 0) {
                return res.status(404).json({
                    message : "영상이 존재하지 않습니다."
                })
            }

            return res.status(400).json({
                message : "에러가 발생하였습니다."
            })
    // // 순 (한국어)
    // if (searchdata.some(i => i[1].startsWith('NN'))) {
    //     if (searchdata.every(i => i[1] !== 'OL')) {
    //         // 완전 한국어 
    //         // 문장에 NN으로 시작하는 한국 단어만 있는 경우
    //         const stNN = searchdata.filter(i => i[1].startsWith('NN'))
    //             .map(i => i[0])


    //     }
    // } else if (!searchdata.some(i => i[1].startsWith('NN'))) {
    //     if (searchdata.every(i => i[1] !== 'OL')) {
    //         // 완전 한국어

    //     }
    // }

    // // 순 (영어)
    // if (searchdata.every(i => i[1] === 'OL')) {

    // }
    // // 영어랑 한국어 섞여있을 때
    // if (searchdata.some(i => i[1].startsWith('NN'))) {
    //     if (searchdata.some(i => i[1] === 'OL')) {
            
    //     }
    // } else if (!searchdata.some(i => i[1].startsWith('NN'))) {
    //     if (searchdata.some(i => i[1] === 'OL')) {
            
    //     }
    // }
    } catch (err) {
        console.log(err)
            return res.status(500).json({
                message : "서버에러가 발생하였습니다"
            })
    }
}

// 개별 조회 
exports.getPost = async (req, res) => {
    const {videosId} = req.params
    try {
        const [checkPost] = await conn.query('SELECT id, channels_id FROM videoposts WHERE id = ?', [videosId])
        if (checkPost.length === 0) {
            return res.status(404).json({
                message : "영상을 찾을 수 없습니다."
            })
        }

        const [count] = await conn.query ('SELECT count(*) AS subCount FROM subscribers WHERE subscribed_id = ?', [checkPost[0].channels_id]);
        const [addPost] = await conn.query(`
            SELECT
                channels.id AS channelId,
                channels.name,
                videoposts.id AS videopostId,
                profiles.location AS profileLocation,
                videoposts.videopost_name AS videopostName,
                videoposts.video_location AS videoLocation,
                videoposts.description,
                videoposts.views,
                videoposts.create_at AS crateAt,
                ? AS subCount
            FROM videoposts
            LEFT JOIN channels
                ON videoposts.channels_id = channels.id
            LEFT JOIN profiles
                ON videoposts.channels_id = profiles.channels_id
            WHERE videoposts.id = ?
            `, [count[0].subCount, videosId]);

            if (addPost.length > 0) {
                return res.status(200).json(addPost[0])
            }

            return res.status(400).json({
                message : "에러가 발생하였습니다."
            })
    } catch {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}

// 전체 조회
exports.allPost = async (req, res) => {
    const {limit, page} = req.query;
    const channelId = req.query.channelId ? req.query.channelId : null;

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
                return ((N - 1) * L)
            }
        }

        const [videoPost] = await conn.query(`
            SELECT
                channels.id AS channelId,
                channels.name,
                profiles.location AS profileLocation,
                videoposts.id AS videopostId,
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
            WHERE
                (? IS NULL OR videoposts.channels_id = ?)
            ORDER BY videoposts.id DESC
            LIMIT ? OFFSET ?
            `, [channelId, channelId, parseInt(limit), pageNumber(parseInt(page),parseInt(limit))]);

            const NextPage = Math.ceil(videoPost.length / limit) === page ? false : true

            if (videoPost.length > 0) { 
                return res.status(200).json({
                    videos : videoPost,
                    meta : {
                        currentPage : page,
                        hasNextPage : NextPage
                    }
                })
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
    const {videopostId, postName, description} = req.body;

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

    const [preLocation] = await conn.query('SELECT thumbnail_location FROM videoposts WHERE channels_id = ? AND id = ?',
        [id, videopostId]
    )

    const thumbnailUrl = new URL(preLocation[0].thumbnail_location).pathname
    const [updatePost] = await conn.query(`
            UPDATE videoposts
                    SET videopost_name = ?, thumbnail_location = ? ,
                        description = ?
                    WHERE id = ? AND channels_id = ?
        `,[postName, location, description, videopostId, id]);
        if (updatePost.affectedRows > 0) {
            await Delete(`[user_id: ${id} - thumbnail]${decoded(thumbnailUrl)}`, req.url.split('/')[1], req.method);

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
    const {videopostId} = req.body;
    
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
       
            await Delete(`[user_id: ${id} - videopost]${decoded(videoUrl)}`, req.url.split('/')[1], req.method);
            await Delete(`[user_id: ${id} - thumbnail]${decoded(thumbnailUrl)}`, req.url.split('/')[1], req.method);
            
            const [deletePost] = await conn.query(`
                DELETE FROM videoposts WHERE id = ? AND channels_id = ?
                `, [videopostId, id]);

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


const decoded = (url) => {
    const index = url.indexOf('%5D') + 3;
    const result = url.substring(index);
    return result;
}
