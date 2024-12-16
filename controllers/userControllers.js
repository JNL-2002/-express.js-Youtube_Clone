const {conn} = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const {Delete} = require('../middleware/FileMiddleware');

// 유저 조회
exports.user = async (req, res) => {
    const {id} = req.user
    try {
        // 유저 조회
        const [selectUser] = await conn.query(`
            SELECT
                channels.email,
                channels.name,
                profiles.location AS profile_location
            FROM channels
            LEFT JOIN profiles
                ON channels.id = profiles.channels_id
            WHERE channels.id = ?
        `, [id]);
        
        if(selectUser.length > 0) {
            return res.status(200).json({
                user : selectUser
            })
        }

        return res.status(400).json({
            message : "에러가 발생하였습니다."
        })
    } catch {
        return res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        })
    }
}

// 회원가입
exports.join = async (req, res) => {
    const {email, password, name, description} = req.body;

    try {
        // 이메일 중복 확인
        const [checkEmail] = await conn.query('SELECT email FROM channels WHERE email = ?',  [email]);
        if (checkEmail.length > 0) {
            return res.status(400).json({
                message : "현재 사용중인 이메일입니다."
            });
        }
        
        // 비밀번호 해싱
        const hashedPW = await bcrypt.hash(password, 10);

        // 회원 가입
        const [join] = await conn.query('INSERT INTO channels (email, password, name, description) VALUES (?, ?, ?, ?)', [email, hashedPW, name, description]);
        if (join.affectedRows > 0) {

            //default 프로필
            const [defaultProfile] = await conn.query('INSERT INTO profiles (channels_id) VALUES (?)', [join.insertId]);
            const [defaultBanner] =  await conn.query('INSERT INTO banners (channels_id) VALUES (?)', [join.insertId]);
                return res.status(201).json({
                    message : '회원가입을 환영합니다.'
            })
        
        }

        return res.status(400).json({
            message : '회원가입 중 에러가 발생하였습니다.'
        });

    } catch {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        });
    }
    
}


// 로그인
exports.login = async (req, res) => {
    const {email, password} = req.body;
    try {
        // 이메일로 회원 정보 받아오기
        const [checkEmail] = await conn.query('SELECT * FROM channels WHERE email = ?', [email]);


        //이메일이 없거나, 비밀번호가 틀렸을 때
        if (checkEmail.length === 0 || !(await bcrypt.compare(password, checkEmail[0].password))) {
            return res.status(400).json({
                message : "email 또는 password가 일치하지 않습니다."
            });
        }
        
        const token = jwt.sign({ id: checkEmail[0].id }, process.env.P_K);
        return res.status(200).json({
            message : "로그인 완료 되었습니다.",
            token : token
        });

    } catch {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        });
    }
}

// 프로필 수정
exports.profileUpload = async (req, res) => {
    const {id} = req.user;

    if (req.imageUploadFail) {
        return res.status(404).json({
            message : "이미지가 아닙니다."
        })
    }
    const {location, fieldname} = req.file;
    try {
        //default 값의 사진을 업로드 된 사진으로 수정한다.
        const [updateProfile] = await conn.query('UPDATE profiles SET location = ? WHERE channels_id = ?', [location, id]);
        await Delete(`[user_id: ${id} - ${fieldname}]`);

        if (updateProfile.affectedRows > 0){
        return res.status(201).json({
            message : "프로필이 수정되었습니다.",
        });
    }
        
        return res. status(400).json({
            message : "에러가 발생하였습니다."
        })
    } catch {  
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        });
    
    }
}


// 배너 수정
exports.bannerUpload = async (req, res) => {
    const {id} = req.user;

    if (req.imageUploadFail) {
        return res.status(404).json({
            message : "이미지가 아닙니다."
        })
    }

    const {location, fieldname} = req.file;
    try {
        //default 값의 사진을 업로드 된 사진으로 수정한다.
        const [updateBanner] = await conn.query('UPDATE banners SET location = ? WHERE channels_id = ?', [location, id]);
        await Delete(`[user_id: ${id} - ${fieldname}]`);

        if (updateBanner.affectedRows > 0) {
            return res.status(201).json({
                message : "배너가 수정되었습니다."
            });
        }

        return res.status(400).json({
            message : "에러가 발생하였습니다."
        });
    } catch {
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        });
    }
}

// 구독하기
exports.subscriber = async (req, res) => {
    const {id} = req.user;
    const { subscribed } = req.body;
    try{
        if(id == subscribed){
            return res.status(400).json({
                message: "자신을 구독할 수 없습니다."
            });
        }

        // 구독을 하고 있을 경우
        const [checkSub] = await conn.query('SELECT id FROM subscribers WHERE channels_id = ? AND subscribed_id = ?', [id ,subscribed]);
        if (checkSub.length > 0) {
            return res.status(400).json({
                message : "이미 구독중 입니다."
            });
        }

        const [newSub] = await conn.query('INSERT INTO subscribers (channels_id, subscribed_id) VALUES (?,?)', [id, subscribed]);
        if (newSub.affectedRows > 0) {
            return res.status(201).json({
                message : "구독이 완료되었습니다."
            });
        }

        res.status(400).json({
            message : "에러가 발생하였습니다."
        });
    } catch {
        res.status(500).json({
            error : "서버에 에러가 발생하였습니다."
        });
    }
}

// 구독 삭제
exports.deleteSub = async (req, res) => {
    const {id} = req.user;
    const {subscribed} = req.body;
    try {
        // 구독을 하고 있는지 확인
        const [checkSub] = await conn.query('SELECT id FROM subscribers WHERE channels_id = ? AND subscribed_id = ?', [id ,subscribed]);
        if (checkSub.length > 0) {
            const [deleteSub] = await conn.query('DELETE FROM subscribers WHERE channels_id = ? AND subscribed_id = ?', [id, subscribed]);
            if (deleteSub.affectedRows > 0) {
                return res.status(201).json({
                    message : "구독이 취소되었습니다."
                });
            }
        } else if (checkSub.length === 0) {
            return res.status(404).json({
                message : "구독하고 있지 않습니다."
            });
        }
        res.status(400).json({
            message : "에러가 발생하였습니다."
        });
    } catch {
        res.status(500).json({
            error : "서버에러가 발생하였습니다."
        });
    }
}