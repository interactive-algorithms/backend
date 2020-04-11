const pool = require("server/db/main.js")
const express = require("express")
const router = express.Router();

router.get("/", (req, res) => {
    pool
    .query(
        `SELECT 
            articles.id as articleID,
            articles.title as articleTitle,
            sections.title as sectionTitle,
            sections.id as sectionID
        FROM articles
        RIGHT JOIN
            sections ON articles.id = sections.articleID
        ORDER BY
            position`
    ).then(([sections]) => {
        const articles = {};
        for(const section of sections){
            if(!articles[section.articleID]){
                articles[section.articleID] = {
                    sections : [],
                    title : section.articleTitle,
                    id : section.articleID
                }
            }
            articles[section.articleID].sections.push({
                id : section.sectionID,
                sectionTitle : section.sectionTitle
            })
        }
        res.send({articles})
    })
})
//articles.id as articleID, articles.title as articleTitle

module.exports = router;