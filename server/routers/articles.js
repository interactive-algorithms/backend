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
                title : section.sectionTitle
            })
        }
        res.send({articles})
    })
})

router.get("/:id", (req, res) => {
    const articleID = req.params.id;
    pool
    .query(
        `SELECT
            articles.id as articleID,
            articles.title as articleTitle,
            sections.title as sectionTitle,
            sections.id as sectionID,
            type,
            content,
            URL,
            alt,
            description
        FROM articles
        RIGHT JOIN
            sections ON sections.articleID = articles.id
        RIGHT JOIN
            generic_items ON sections.id = generic_items.sectionID
        LEFT JOIN
            images ON generic_items.id = images.genericItemID 
        WHERE sections.articleID = ? 
        ORDER BY sections.position, generic_items.position
        `,
        [articleID]
    ).then(([items]) => {
        const sectionIndices = {}
        const article = {
            id: articleID,
            sections : []
        }
        for(const item of items){
            if(!article.title){
                article.title = item.articleTitle;
            }
            if(sectionIndices[item.sectionID] == undefined){
                sectionIndices[item.sectionID] = article.sections.length;
                article.sections.push({
                    title : item.sectionTitle,
                    id : item.sectionID,
                    content : []
                })
            }
            const obj = item.type == 'img' ?
                {
                    url : item.URL,
                    alt : item.alt,
                    description : item.description,
                    type : "img"
                } : {
                    type : item.type,
                    content : item.content
                }
            ;
            article.sections[sectionIndices[item.sectionID]].content.push(obj);
        }
        res.send({article});
    })
})

module.exports = router;