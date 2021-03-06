const fs = require('fs');
const bcrypt = require("bcrypt")
const {saltRounds} = require("server/var")

const mysql = require('mysql2');
const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : `interactive-algorithms`
});

const promisePool = pool.promise();

const createUserTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`users` (`id` INT NOT NULL AUTO_INCREMENT,`username` VARCHAR(45) NOT NULL,`email` VARCHAR(256) NOT NULL,`password` VARCHAR(256) NOT NULL, PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC),UNIQUE INDEX `email_UNIQUE` (`email` ASC),UNIQUE INDEX `username_UNIQUE` (`username` ASC));";

const createArticlesTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`articles` (`id` INT NOT NULL AUTO_INCREMENT,`title` VARCHAR(256) NULL,PRIMARY KEY (`id`));";

const createGenericItemsTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`generic_items` (`id` INT NOT NULL AUTO_INCREMENT,`sectionID` INT NOT NULL,`position` INT NULL,`type` VARCHAR(256) NOT NULL,`content` TEXT(65535) NULL,PRIMARY KEY (`id`));"

const createImagesTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`images` (`id` INT NOT NULL AUTO_INCREMENT,`genericItemID` INT NOT NULL,`URL` VARCHAR(256) NOT NULL,`alt` VARCHAR(256) NOT NULL,`description` TEXT(65535) NULL,PRIMARY KEY (`id`));";

const createSectionsTable ="CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`sections` (`id` INT NOT NULL AUTO_INCREMENT,`title` VARCHAR(256) NOT NULL,`interactiveType` VARCHAR(256) NOT NULL,`position` INT NOT NULL,`articleID` INT NOT NULL,PRIMARY KEY (`id`));"

const createMessagesTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`messages` (`id` INT NOT NULL AUTO_INCREMENT,`time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,`content` TEXT NULL,`username` VARCHAR(45) NOT NULL,`sectionID` INT NOT NULL,PRIMARY KEY (`id`));";


promisePool.query(createUserTable, (err, res) => {
    if(err) console.log(err);
    promisePool.query(
        `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
        ["test", "test@gmail.com"]
    ).then(([existingUsers]) => {
        if(existingUsers.length == 0){
            bcrypt.hash("test", saltRounds, (err, hash) => {
                promisePool.query(
                    `INSERT INTO users (username, email, password) VALUES (?,?,?)`,
                    ["test", "test@gmail.com", hash]
                );
            });
        }
    });
});

promisePool.query(createArticlesTable, (err, res) => {
    if(err) console.log(err);
    promisePool.query(createGenericItemsTable, (err, res) => {
        if(err) console.log(err);
        promisePool.query(createImagesTable, (err, res) => {
            if(err) console.log(err);
            promisePool.query(createSectionsTable, (err, res) => {
                if(err) console.log(err);
                importAllArticles();
            })
        });
    });
});

promisePool.query(createMessagesTable, (err, res) => {
    if(err) console.log(err);
});

const importAllArticles = () => {
    fs.readdir("server/db/articles", (err, files) => {
        for(const file of files){
            fs.readFile(`server/db/articles/${file}`, 'utf8', (err, data) => {
                const lines = data.split("\n").map(line => {
                    return line.split(" ").filter(s => s != "");
                });
                const title = lines[0].slice(1, lines[0].length).join(" ");
                const amountOfSections = Number(lines[1][1]);
                const sectionTitles = [];
                const interactiveTypes = [];
                for(let i = 0; i < amountOfSections * 2; i += 2){
                    sectionTitles.push(lines[2 + i].join(" "));
                    interactiveTypes.push(lines[2 + i + 1].join(" "));
                }
                const sectionContent = {};
                let idx = 2 + amountOfSections * 2;
                while(idx < lines.length){
                    const section = Number(lines[idx++][0]) - 1;
                    sectionContent[section] = [];
                    while(
                        idx < lines.length &&
                        lines[idx].length != 1
                    ){
                        if(lines[idx][0] == 'img'){
                            const url = lines[idx][1].substring(1, lines[idx][1].length - 1);
                            let readerState = 0;
                            let alt = "";
                            let description = "";
                            for(const word of lines[idx].slice(2, lines[idx].length)){
                                if(word[0] == '"'){
                                    if(readerState == 0){
                                        readerState = 1;
                                        alt += word.substring(1, word[word.length - 1] == '"' ? word.length - 1  : word.length) + " ";
                                    }else{
                                        description += word.substring(1, word[word.length - 1] == '"' ? word.length - 1  : word.length) + " ";
                                    }
                                }else if(word[word.length - 1] == '"'){
                                    if(readerState == 1){
                                        readerState = 2;
                                        alt += word.substring(0, word.length - 1) + " ";
                                    }else{
                                        readerState == 3;
                                        description += word.substring(0, word.length - 1) + " ";
                                    }
                                }else{
                                    if(readerState == 1){
                                        alt += word + " ";
                                    }else{
                                        description += word + " ";
                                    }
                                }
                            }
                            sectionContent[section].push({
                                type : "img",
                                url,
                                alt : alt.substring(0, alt.length - 1),
                                description : description.substring(0, description.length - 1)
                            })
                        }else{
                            const content = lines[idx].slice(1, lines[idx].length).join(" ").substring(1, lines[idx].slice(1, lines[idx].length).join(" ").length - 1);
                            sectionContent[section].push({
                                type : lines[idx][0],
                                content : content
                            })
                        }
                        idx++;
                    }
                }
                console.log(title)
                console.log(amountOfSections)
                console.log(sectionTitles)
                console.log(interactiveTypes)
                console.log(sectionContent)
                // insert data in db
                promisePool
                .query(`SELECT id FROM articles WHERE title='${title}' LIMIT 1`)
                .then(([possiblyExistingArticle]) => {
                    if(possiblyExistingArticle.length == 0){
                        promisePool
                        .query(`INSERT INTO articles (title) VALUES ('${title}')`)
                        .then(([articleInsertionResult]) => {
                            for(let i = 0; i < amountOfSections; i++){
                                promisePool
                                .query(`INSERT INTO sections (title, position, articleID, interactiveType) VALUES ('${sectionTitles[i]}',${i},${articleInsertionResult.insertId},'${interactiveTypes[i]}');`)
                                .then(([sectionInsertionResult]) => {
                                    for(let j = 0; j < sectionContent[i].length; j++){
                                        const item = sectionContent[i][j];
                                        promisePool
                                        .query(`INSERT INTO generic_items (sectionID, position, type, content) VALUES (${sectionInsertionResult.insertId}, ${j}, '${item.type}', '${item.content || ""}')`)
                                        .then(([itemInsertionResult]) => {
                                            if(item.type == 'img'){
                                                promisePool
                                                .query(`INSERT INTO images (genericItemID, URL, alt, description) VALUES (${itemInsertionResult.insertId}, '${item.url}', '${item.alt}', '${item.description}')`);   
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    });
}

module.exports = promisePool;
