require("dotenv").config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : `interactive-algorithms`
});

const truncate = table => {
    return `TRUNCATE TABLE ${table};`
}

connection.query(truncate("articles"), (err, res) => {
    if(err) console.log(err);
    connection.query(truncate("generic_items"), (err, res) => {
        if(err) console.log(err);
        connection.query(truncate("images"), (err, res) => {
            if(err) console.log(err);
            connection.query(truncate("sections"), (err, res) => {
                if(err) console.log(err);
                connection.close();
            })
        });
    });
});