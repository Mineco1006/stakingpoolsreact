const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const qkc = require("./quarkchain");
const Web3 = require("web3");
const fs = require('fs');
const https = require('https');
const colors = require("colors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const db = mysql.createPool({
    host: "localhost",
    user: "Admin",
    password: "stakingpools@admin1006",
    database: "stakingpools"
});
console.log("[STATUS] ".magenta + "Database connection established".green);

const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/qkcstakingpools.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/qkcstakingpools.xyz/fullchain.pem'),
  }, app);

app.post("/api/getSnapshot", function(req, res){
    const chainId = req.body.chainId
    const sqlStatement = `SELECT * FROM snapshot WHERE id=(SELECT MAX(id) FROM snapshot WHERE chainId=(?) )` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
           console.log("[POST] ".magenta + "Snapshot query returned".green);
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
        console.log("[POST] ".magenta + "Took new snapshot".green);
    });
});

app.post("/api/newROI", function(req, res){
    const sqlStatement = `INSERT INTO roi (chainId, roi) VALUES (?, ?);`; //sql insert statement
    const roi = req.body.roi;
    const chainId = req.body.chainId;

    db.query(sqlStatement, [chainId, roi], function(err, result){
        console.log("[POST] ".magenta + "Added new ROI value".green);
    });
});

app.post("/api/getLatestROI", function(req, res){
    const chainId = req.body.chainId;
    const sqlStatement = `SELECT * FROM roi WHERE id=(SELECT MAX(id) FROM roi WHERE chainId=(?))` //sql select statement
    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
            console.log("[POST] ".magenta + "Fetched ROI value".green);
            res.send(result[0]);
        }
    });
});

app.post("/api/getContractInfo", function(req, res){
    const chainId = req.body.chainId;
    const sqlStatement = `SELECT * FROM snapshot WHERE id=(SELECT MAX(id) FROM snapshot WHERE chainId=(?))` //sql select statement

    db.query(sqlStatement, [chainId], function(err, result){
        if(result != undefined && result != null) {
           qkc.getContractInfo(chainId, result[0]).then((resolve) => {
               res.send(resolve);
               console.log("[POST] ".magenta + "Contract information returned".green);
           });
        } else {
            console.log("[ERROR] ".magenta + "Could not fetch snapshot from database".red);
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
                console.log("[POST] ".magenta + "User information returned".green);
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
        console.log("[POST] ".magenta + "New transaction logged".green);
    });
});

app.post("/api/getBonus", function(req, res){
    const identifier = req.body.identifier;
    const chainId = req.body.chainId;

    var sqlStatement;

    if(typeof identifier == "number") {
        sqlStatement = `SELECT * FROM transactions WHERE chainId=(?);`
    } else if(typeof identifier == "string"){
        sqlStatement = `SELECT * FROM transactions WHERE address=(?) AND chainId=(?);`
    }

    db.query(sqlStatement, [identifier, chainId], function(err, result){
        if(result != undefined && result != null) {
            const resolve = qkc.getBonus(result);
            res.send({res: resolve});
            console.log("[POST] ".magenta + "Bonus query successfully returned".green);
        } else {
            console.log("[ERROR] ".magenta + "Could not fetch bonus from database".red);
        }
        
    });
});

httpsServer.listen(500, ()=>{
    console.log("[STATUS] ".magenta + "running on port 3001".green);
});
