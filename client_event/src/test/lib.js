import Web3 from 'web3';
import axios from 'axios';


axios.defaults.baseURL = 'http://jrpc.mainnet.quarkchain.io:38391';
axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

async function generateTx(to, data, value, from = null) {
    if (from === null) {
      from = this.address;
    }
    const transactionCountResp = await axios.post(
      "/getTransactionCount",
      { address: from },
    );
    const fromFullShardKey = "0x" + from.slice(-8);
    let toRecipient;
    let toFullShardKey;
    if (to !== "") {
      toRecipient = to.slice(0, 42);
      toFullShardKey = "0x" + to.slice(42);
    } else {
      toRecipient = "";
      toFullShardKey = fromFullShardKey;
    }
    const rawTx = {
      nonce: transactionCountResp.data.transactionCount,
      from: from.slice(0, 42),
      to: toRecipient,
      gasPrice: "0x" + (2).toString(16),
      gas: "0x" + (350000).toString(16),
      value: "0x" + value.toString(16),
      data,
      fromFullShardKey,
      toFullShardKey,
      networkId: `0x${(1).toString(16)}`,
      gasTokenId: `0x${this.gasTokenId.toString(16)}`,
      transferTokenId: `0x${this.transferTokenId.toString(16)}`,
    }

}

async function signAndSendTx(rawTx){
    let txId = '';
    try {
        txId = await this.qPocketSignAndSendTx(rawTx);
    } catch (error) {
        console.log("error 404")
        return;
    }

    txId = txId;

    const success = !!txId && !txId.startsWith('0x000000000000000000000000000000000000000');
    if (success) {
        //const url = (<a href="/tx/${txId}">${txId}</a>);
        console.log(`Successfully sent transaction ${txId}.`);
        
    } else {
        console.log("Sending transaction failed", 7000);
    }
}

async function metaMaskSignTyped(tx, web3, from) {
    console.log("Awaiting MetaMask signature confirmation...");
    return new Promise(function(resolve,reject) {
        var params = [getTypedTx(tx), from];
        var method = 'eth_signTypedData';

        web3.currentProvider.sendAsync({
          method,
          params,
          from,
        }, function (err, result) {
          if(result.error !== undefined) {
            console.log("It looks you declined the transaction in MetaMask");
            console.log(result.error);
          }
          resolve(result.result)
        })
    }.bind(this));
  }

async function sendRawTx(rawTx) {
  let txResp
  console.log("test")
  try {
    txResp = await axios.post("", {
      "jsonrpc": "2.0",
      "method": "sendRawTransaction",
      "params": [rawTx],
      "id": 1
    });
    console.log("txResp: " + txResp)
  } catch(error) {
    console.log("Sending transaction failed")
  }
}

function getDeviceType() {
  var ua = navigator.userAgent,
          isWindowsPhone = /(?:Windows Phone)/.test(ua),
          isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
          isAndroid = /(?:Android)/.test(ua),
          isFireFox = /(?:Firefox)/.test(ua),
          isChrome = /(?:Chrome|CriOS)/.test(ua),
          isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
          isPhone = /(?:iPhone)/.test(ua) && !isTablet,
          isPc = !isPhone && !isAndroid && !isSymbian;
  return {
    isPhone,
    isPc
  }
}

function getTypedTx(tx) {

  let msgParams = [
    {
      type: 'uint256',
      name: 'nonce',
      value: `0x${tx.nonce.toString(16)}`
    },
    {
      type: 'uint256',
      name: 'gasPrice',
      value: `0x${tx.gasPrice.toString(16)}`
    },
    {
      type: 'uint256',
      name: 'gasLimit',
      value: `0x${tx.gasLimit.toString(16)}`
    },
    {
      type: 'uint160',
      name: 'to',
      value: `${tx.to}`
    },
    {
      type: 'uint256',
      name: 'value',
      value: `0x${tx.value.toString(16)}`
    },
    {
      type: 'bytes',
      name: 'data',
      value: `0x${tx.data.toString(16)}`
    },
    {
      type: 'uint256',
      name: 'networkId',
      value: '0x1'
    },
    {
      type: 'uint32',
      name: 'fromFullShardKey',
      value: `${tx.fromFullShardKey}`
    },
    {
      type: 'uint32',
      name: 'toFullShardKey',
      value: `${tx.toFullShardKey}`
    },
    {
      type: 'uint64',
      name: 'gasTokenId',
      value: '0x8bb0'
    },
    {
      "type": 'uint64',
      "name": 'transferTokenId',
      "value": '0x8bb0'
    },
    {
      "type": 'string',
      "name": 'qkcDomain',
      "value": 'bottom-quark'
    }
  ];
  console.log(msgParams)
  return msgParams;
}

export {metaMaskSignTyped, getTypedTx, getDeviceType, sendRawTx};