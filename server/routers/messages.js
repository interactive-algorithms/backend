const jwt = require("jsonwebtoken");
const pool = require("server/db/main.js");
const cookieParser = require('cookieparser')

const insertMessage = (sectionID, username, message, callback) => {
    pool
    .query(
        "INSERT INTO messages (content, username, sectionID) VALUES (?, ?, ?)",
        [message, username, sectionID]
    )
    .then(([messageQueryResult]) => {
        pool
        .query(`SELECT 
            username,
            messages.id AS id,
            time,
            content
        FROM messages WHERE id = ${messageQueryResult.insertId}`)
        .then(([[message]]) => {
            callback(message);
        })
    })
}

const sendAllMessages = (socket, sectionID) => {
    pool
    .query(
        `
        SELECT
            username,
            messages.id AS id,
            time,
            content
        FROM
            messages
        WHERE
            messages.sectionID = ?
        ;`,
        [sectionID]
    )
    .then(([messages]) => {
        socket.emit("all", messages);
    })
}

module.exports = io => {
    const messaging = io.of("/messaging")
    .use((socket, next) => {
        const cookies = cookieParser.parse(socket.request.headers.cookie);
        const token = cookies.TOKEN;
        if(token){
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => { 
                if (!err) {
                    socket.username = data.username;
                    next();
                }
            })  
        }
    })
    .on("connection", socket => {

        socket.on("joinSectionChat", sectionID => {
            socket.sectionID = sectionID;
            socket.join(sectionID);
            sendAllMessages(socket, sectionID);
        })

        socket.on("post", message => {
            if(socket.sectionID && socket.username){
                insertMessage(socket.sectionID, socket.username, message, (messageObject) => {
                    messaging.in(socket.sectionID).emit("new", messageObject);
                })
            }
        })
    })
};