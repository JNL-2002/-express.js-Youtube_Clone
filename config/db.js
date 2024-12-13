const mysql = require('mysql2/promise');
require('dotenv').config();

exports.conn = mysql.createPool({
    user : 'root',
    password : process.env.DBPW,
    database : 'ytClone',
    host : '127.0.0.1',
    port : '3306',
});

