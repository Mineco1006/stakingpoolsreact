const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

const db = mysql.createPool({
    host: "localhost",
    user: "Nico",
    password: "Nico1006",
    database: "stakingpools"
});
console.log("database connection established");

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}));

app.post("/api/getSnapshot", function(req, res){
    const chainId = req.body.chainId
    const sqlStatement = `SELECT * FROM snapshot WHERE id=(SELECT MAX(id) FROM snapshot WHERE chainId=(?) )` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
           console.log("Snapshot query returned")
           res.send(result[0]) 
        }
    });
});

app.post("/api/newSnapshot", function(req, res){
    const sqlStatement = `INSERT INTO snapshot (chainId, timestamp, balance) VALUES (?, ?, ?);` //sql insert statement
    const timestamp = Date.now();
    const chainId = req.body.chainId;
    const balance = req.body.balance;

    db.query(sqlStatement, [chainId, timestamp.toString(), balance.toString()], function(err, result){
        console.log("Took new snapshot")
    });
});

app.post("/api/newROI", function(req, res){
    const sqlStatement = `INSERT INTO roi (chainId, roi) VALUES (?, ?);` //sql insert statement
    const roi = req.body.roi
    const chainId = req.body.chainId

    db.query(sqlStatement, [chainId, roi], function(err, result){
        console.log("Added new ROI value")
    });
});

app.post("/api/getLatestROI", function(req, res){
    const chainId = req.body.chainId
    const sqlStatement = `SELECT * FROM roi WHERE id=(SELECT MAX(id) FROM roi WHERE chainId=(?))` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
            console.log("Fetched ROI value")
            res.send(result[0])
        }
    });
});

app.listen(3001, ()=>{
    console.log("running on port 3001")
});