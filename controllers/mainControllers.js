const {conn} = require('../config/db');


// 검색
exports.search = (req, res) => {
    const {search} = req.query;
    const result = toString(search)
                    .replace(/[^A-za-z0-9-ㄱ-ㅎ-ㅏ-ㅣ-가-힣]/gi, '')
    
}