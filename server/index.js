const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const qkc = require("./quarkchain");
const Web3 = require("web3");
const fs = require('fs');
const https = require('https');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));




const db = mysql.createPool({
    host: "localhost",
    user: "Admin",
    password: "stakingpools@admin1006",
    database: "stakingpools"
});
console.log("database connection established");

const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/qkcstakingpools.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/qkcstakingpools.xyz/fullchain.pem'),
  }, app);

app.post("/api/getSnapshot", function(req, res){
    const chainId = req.body.chainId
    const sqlStatement = `SELECT * FROM snapshot WHERE id=(SELECT MAX(id) FROM snapshot WHERE chainId=(?) )` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
           console.log("Snapshot query returned");
           res.send(result[0]) ;
        }
    });
});

app.post("/api/newSnapshot", function(req, res){
    const sqlStatement = `INSERT INTO snapshot (chainId, timestamp, balance) VALUES (?, ?, ?);` //sql insert statement
    const timestamp = Date.now();
    const chainId = req.body.chainId;
    const balance = req.body.balance;

    db.query(sqlStatement, [chainId, timestamp.toString(), balance.toString()], function(err, result){
        console.log("Took new snapshot");
    });
});

app.post("/api/newROI", function(req, res){
    const sqlStatement = `INSERT INTO roi (chainId, roi) VALUES (?, ?);`; //sql insert statement
    const roi = req.body.roi;
    const chainId = req.body.chainId;

    db.query(sqlStatement, [chainId, roi], function(err, result){
        console.log("Added new ROI value");
    });
});

app.post("/api/getLatestROI", function(req, res){
    const chainId = req.body.chainId;
    const sqlStatement = `SELECT * FROM roi WHERE id=(SELECT MAX(id) FROM roi WHERE chainId=(?))` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
            console.log("Fetched ROI value");
            res.send(result[0]);
        }
    });
});

app.post("/api/getContractInfo", function(req, res){
    const chainId = req.body.chainId;
    const sqlStatement = `SELECT * FROM snapshot WHERE id=(SELECT MAX(id) FROM snapshot WHERE chainId=(?) )` //sql select statement

    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
           qkc.getContractInfo(chainId, result[0]).then((resolve) => {
               res.send(resolve);
               console.log("Contract information returned");
           });
        }
    });
});

app.post("/api/getUserInformation", function(req, res){
    const chainId = req.body.chainId;
    const address = req.body.address;

    if(typeof address == "string"){
        if(address.length == 50){
            qkc.getUserInformation(address, chainId).then((resolve) => {
                res.send(resolve);
                console.log("User information returned");
            });
        }
    }
});

app.post("/api/getNonce", function(req, res){
    const address = req.body.address;

    if(typeof address == "string"){
        if(address.length == 50){
            qkc.getNonce(address).then((resolve) => {
                res.send({resolve});
                console.log("Nonce fetched")
            });
        }
    }

});

app.post("/api/logTx", function(req, res){
    const address = req.body.address;
    const chainId = Number(req.body.chainId);
    const type = req.body.type;
    const amount = Number(req.body.amount);
    const txId = req.body.txId;
    const bonus = qkc.calcBonus(amount);


    const sqlStatement = `INSERT INTO transactions (chainId, address, type, amount, bonus, txId) VALUES (?, ?, ?, ?, ?, ?);` //sql select statement
    
    db.query(sqlStatement, [chainId, address, type, amount, bonus, txId], function(err, result){
        console.log("New transaction logged");
    });
});



httpsServer.listen(500, ()=>{
    console.log("running on port 500");
});