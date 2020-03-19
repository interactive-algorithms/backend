const mysql = require(`mysql`);
const connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : `interactive-algorithms`
});
connection.connect(err => {
    if (err) {
      console.error(`error connecting: ` + err.stack);
      return;
    } else {
        console.log(`successfully connected to db (` + process.env.DB_HOST + `)`);
    }
});
const createUserTable = "CREATE TABLE IF NOT EXISTS `interactive-algorithms`.`users` (`id` INT NOT NULL AUTO_INCREMENT,`username` VARCHAR(45) NOT NULL,`email` VARCHAR(256) NOT NULL,`password` VARCHAR(256) NOT NULL,`token` VARCHAR(256) NULL DEFAULT NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC),UNIQUE INDEX `email_UNIQUE` (`email` ASC),UNIQUE INDEX `username_UNIQUE` (`username` ASC),UNIQUE INDEX `token_UNIQUE` (`token` ASC));";
connection.query(createUserTable, (err, res) => {
    if(err) console.log(err);
});
