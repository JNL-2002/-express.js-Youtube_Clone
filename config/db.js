const mysql = require('mysql2/promise');
require('dotenv').config();

exports.conn = mysql.createPool({
    user : 'root',
    password : process.env.DBPW,
    database : 'ytClone',
    host : process.env.DB_HOST,
    port : '3306',
});

