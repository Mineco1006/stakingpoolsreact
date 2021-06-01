const Web3 = require("web3");
const QuarkChain = require("quarkchain-web3");
const constants = require("./config");
const axios = require("axios");



module.exports.getContractInfo =  function(chainId, snapshot){
    var web3 = new Web3();
    QuarkChain.injectWeb3(web3, "http://jrpc.mainnet.quarkchain.io:38391/");
    
    //return values decl
    var bal;
    var minerFee;
    var poolFee;
    var minStake;
    var isClosed;
    var roiMon;

    const contractAddress = constants.poolContractAddress[chainId] + constants.fullShardKey[chainId];
    const poolContract = web3.qkc.contract(constants.ABIinterface).at(contractAddress);

    return new Promise((resolve) => {
        web3.qkc.getBalance(contractAddress, function(err, res){
            bal = Number(res);

            poolContract.minerFee.call(function(err, res){
            minerFee = Number(res);

                poolContract.poolFee.call(function(err, res){
                poolFee = Number(res);

                    poolContract.minStake.call(function(err, res){
                        minStake = Number(res);

                        poolContract.isClosed.call(function(err, res){
                            isClosed = res;

                            roiMon = Number(((((bal-Number(snapshot.balance))/((Number(snapshot.balance)/constants.blockAllowance[chainId]).toFixed(0)*constants.blockAllowance[chainId]))/((Date.now()-Number(snapshot.timestamp))))*(1000*3600*24*30)*(1-((minerFee+poolFee)*1e-4))*100).toFixed(3));

                            resolve({
                                balance: bal,
                                minerFee: minerFee,
                                poolFee: poolFee,
                                minStake: minStake,
                                isClosed: isClosed,
                                roiMon: roiMon,
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports.getUserInformation = function(address, chainId){
    var web3 = new Web3();
    QuarkChain.injectWeb3(web3, "http://jrpc.mainnet.quarkchain.io:38391");

    //return values decl
    var bal;
    var stake;

    const poolContract = web3.qkc.contract(constants.ABIinterface).at(constants.poolContractAddress[chainId] + constants.fullShardKey[chainId]);

    return new Promise((resolve) => {
        poolContract.getStakesWithRewards(QuarkChain.getEthAddressFromQkcAddress(address), {from: QuarkChain.getEthAddressFromQkcAddress(address)}, function(err, res){
            stake = Number(res);

            web3.qkc.getBalance(address, function(err, res){
                bal = Number(res);

                resolve({
                    balance: bal,
                    stake: stake
                })
            });
        });
    });
}

module.exports.calcBonus = function(amount, chainId){ //calculates bonus for database queries
    if(chainId != 2){
        const bonusRel = constants.bonusRel;
        const bonus = amount*bonusRel;
        return bonus;
    } else {
        return 0;
    }
}

module.exports.getBonus = function(SQLArray){ //sums bonuses of a specific address or chainId
    var amount = 0;
    if(Array.isArray(SQLArray)){
        
        for(var i = 0; i < SQLArray.length; i++){
            amount += SQLArray[i].bonus;
        }
    }
    return amount;
}