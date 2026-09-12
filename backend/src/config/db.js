// const mysql = require("mysql2");
// require("dotenv").config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     multipleStatements: true
// });

// db.connect((err) => {
//     if (err) {
//         console.error("❌ Database Connection Failed");
//         console.error(err.message);
//         process.exit(1);
//     } else {
//         console.log("✅ MySQL Connected to", process.env.DB_NAME);
//     }
// });

// module.exports = db;




const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kahani_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    } else {
        console.log("✅ MySQL Pool Connected to", process.env.DB_NAME || 'kahani_db');
        connection.release();
    }
});

module.exports = db;