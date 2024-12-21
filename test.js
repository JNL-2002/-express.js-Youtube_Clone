// const {Delete} = require('./middleware/profileMiddleware');

// const path = require("path");
// const fs = require('fs').promises;

// Delete('[user_id: 4]');

// let now = Date.now();
// let date = new Date(now);
// console.log(date.toString());

// const abb = path.join(__dirname, '/videos');
// fs.readFile(`${abb}/readme.txt`)
//     .then((date) => {
//         console.log(date.toString());
//     })
//     .catch((err) => {
//         console.error(err)
//     })

//     console.log(process.cwd());

// '%5D'를 기준으로 문자열을 자릅니다.
// const endIndex = url.indexOf('%5D') + 3;
// const result = url.substring(endIndex);

// console.log(result);
// const abb = ' ㅎㅇ ddvv avbcba s          DDDd11.';

// console.log(abb.replace(/[^A-za-z0-9-ㄱ-ㅎ-ㅏ-ㅣ-가-힣]/gi, ''), abb.length);
//영어 한글 제외 모든 특수문자 제거


// const list = ['오리무중 친구들', '오리와 친구들', '오리들', '오리'];
// const result = '오리와 뒤뚱 뒤뚱 걷는 친구들';
// const r = result.match(/[가-힣a-zA-Z]+/g);
// for(let i = 0; r.length >= i; i++){
// const results = fuzzy.filter(r[i], list);
// console.log(results)
// }

const spawn = require('child_process').spawn;

const searchData = "안녕하세용용"

const process = spawn('python', ['search.py', `${searchData}`], {
    encoding : "utf8"
});


process.stdout.on('data', function add (data) {
    const searchData1 = data.toString();
    console.log(searchData1)
});


