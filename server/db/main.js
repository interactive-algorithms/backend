const fs = require('fs');

const mysql = require('mysql2');
const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : `interactive-algorithms`
});
const promisePool = pool.promise();

const createUserTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`users` (`id` INT NOT NULL AUTO_INCREMENT,`username` VARCHAR(45) NOT NULL,`email` VARCHAR(256) NOT NULL,`password` VARCHAR(256) NOT NULL, PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC),UNIQUE INDEX `email_UNIQUE` (`email` ASC),UNIQUE INDEX `username_UNIQUE` (`username` ASC));";

/*promisePool.query(createUserTable, (err, res) => {
    if(err) console.log(err);
});*/

fs.readdir("server/db/articles", (err, files) => {
    for(const file of files){
        console.log(file)
        fs.readFile(`server/db/articles/${file}`,'utf8' , (err, data) => {
            const lines = data.split("\n").map(line => {
                return line.split(" ").filter(s => s != "");
            });
            const title = lines[0][1];
            console.log(title)
            const amountOfSections = Number(lines[1][1]);
            console.log(amountOfSections)
            const sectionTitles = [];
            for(let i = 0; i < amountOfSections; i++){
                sectionTitles.push(lines[2 + i].join().replace(",", " "));
            }
            console.log(sectionTitles)
            const sectionContent = {};
            let idx = 2 + amountOfSections;
            while(idx < lines.length){
                const section = Number(lines[idx++][0]);
                sectionContent[section] = [];
                console.log(section)
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
                        const content = lines[idx].slice(1, lines[idx].length).join().substring(1, lines[idx].slice(1, lines[idx].length).join().length - 1);
                        sectionContent[section].push({
                            type : lines[idx][0],
                            content : content
                        })
                    }
                    idx++;
                }
                console.log(sectionContent[section])
            }
        })
    }
});

module.exports = promisePool;
