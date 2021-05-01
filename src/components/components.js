import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import React from 'react';
import axios from 'axios';
import {ABIinterface, roiABIinterface, poolROIContractAddress, poolContractAddress, fullShardKey, jrpcUrl, standardShardKeys} from './config.js'
import {metaMaskSignTyped, getDeviceType, sendRawTx} from '../test/lib'

let web3 = new Web3();
QuarkChain.injectWeb3(web3, jrpcUrl)

class Navbar extends React.Component {
  componentDidMount() {
    document.title = "QKC Staking Pools"
  }

  render() {
    return(
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style={{marginBottom:'25px'}}>
          <div className="container-fluid">

            <a className="navbar-brand" href="https://qkcstakingpools.xyz/">QuarkChain Staking Pools</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a class="nav-link" href="https://t.me/joinchat/ar58V6PuG5tkM2Y0" target="_blank" rel="noreferrer">Telegram</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="https://plakolm1006.medium.com/" target="_blank" rel="noreferrer">News</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="https://twitter.com/Quark_Chain" target="_blank" rel="noreferrer">Twitter</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
    )
  }
}

async function getContractInformation(poolAddress, poolROIAddress) {
  const roiContract = web3.qkc.contract(roiABIinterface).at(poolROIAddress);
  const poolContract = web3.qkc.contract(ABIinterface).at(poolAddress);
  let minerFee;
  let poolFee;

  let v1;
  let v2;
  let v3;
  let v4;
  let v5;
  let v6;
  let v7;

  web3.qkc.getBalance(poolAddress, function(err, res) {
    v1 = Number((res/10**18).toFixed(2)).toLocaleString() + " QKC";
  });

  poolContract.minerFee.call(function(err, res){
    minerFee = res/10000
    v2 = res/100+"%";
  });
  poolContract.poolFee.call(function(err, res){
    poolFee = res/10000
    v3 = res/100+"%";
  });
  poolContract.minStake.call(function(err, res){
    v4 = Number((res/10**18).toFixed(2)).toLocaleString() + " QKC";
  });

  poolContract.isClosed.call(function(err, res){
      if(res == false){
        v5 = "Open";
      }
      if(res == true){  
        v5 = "Closed";
      }
  });

  roiContract.calculateROI(1, {}, function(err, res) {
    let result = ((res/10**16)*(1-(minerFee + poolFee))).toFixed(3)
    v6 = result + "% / " + (result*12).toFixed(1) + "%";
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        balance: v1,
        minerFee: v2,
        poolFee: v3,
        minStake: v4,
        status: v5,
        roi: v6,
        userStake: v7
      })
    }, 1500)
  })
}

function getUserStake(poolAddress, userAddress) {
  const poolContract = web3.qkc.contract(ABIinterface).at(poolAddress);
  let stake

  poolContract.getStakesWithRewards(userAddress, {from: userAddress}, function(err, res){
    stake = Number((res/10**18).toFixed(2)).toLocaleString() + " QKC"
  })

  
  

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(stake)
    }, 1500)
  })
}

class PoolInterface extends React.Component {
  // poolAddress, poolROIAddress, index, miner, web3

  state = {
    balance : '',
    roi : '',
    minStake : '',
    poolStatus : ''
  }

  componentDidMount(props) {
    getContractInformation(this.props.poolAddress, this.props.poolROIAddress).then(data => {
      this.setState({balance: data.balance, roi: data.roi, minStake: data.minStake, poolStatus: data.status});
    });
  }

  render() {
    
    return (
      <table className="pool">
        <thead>
          <tr className="rowcolour1" href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress}>
                <th colSpan="2">
                  <a href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress} target="_blank" className="href">Chain {this.props.index} Pool</a>
                </th>
          </tr>
        </thead>
        <tbody>
            <tr className="rowcolour2">
                <td>Estimated ROI monthly/annual</td>
                <td>{this.state.roi}</td>
            </tr>
            <tr className="rowcolour1">
                <td>Total Stakes</td>
                <td>{this.state.balance}</td>
            </tr>
            <tr className="rowcolour2">
                <td>Minimum Stake</td>
                <td>{this.state.minStake}</td>
            </tr>
            <tr className="rowcolour1">
                <td>Pool Status</td>
                <td>{this.state.poolStatus}</td>
            </tr>
            <tr className="rowcolour2">
              <td>Miner</td>
              <td>{this.props.miner}</td>
            </tr>
        </tbody>
        <PoolUserInterface poolAddress={this.props.poolAddress} web3={this.props.web3} index={this.props.index}/>
      </table>
      
    )
  }
}

class PoolUserInterface extends React.Component {
  //poolAddress, web3, index

  state={
    userAddress: '',
    stake: ''
  }

  componentDidMount(props) {
    if(window.web3) {
      this.props.web3.eth.getAccounts().then(function(accounts) {
      this.setState({userAddress: accounts[0]})
      getUserStake(this.props.poolAddress, this.state.userAddress).then(function(res){
        this.setState({stake: res})
      }.bind(this))
    }.bind(this))

    
    }
  }

  render() {
    if(window.web3){
      return (
        <table>
          <tr className="rowcolour1">
            <td>
              Your Address
            </td>
            <td colSpan="2">
              {this.state.userAddress + standardShardKeys[this.props.index]}
            </td>
          </tr>
          <tr className="rowcolour2">
            <td>
              Your Stake
            </td>
            <td colSpan="2">
              {this.state.stake}
            </td>
          </tr>
          <PoolAllocateAndWithdraw poolAddress={this.props.poolAddress} web3={this.props.web3}/>
        </table>
        
    )
    }else{
      return (
          <tr className="rowcolour1">
            <td colSpan="2">
              Please enable your web3 wallet to check your stake
            </td>
          </tr>
      )
    }
    
  }
}



class PoolAllocateAndWithdraw extends React.Component {
  //poolAddress, web3

  state = {
    add: '',
    withdraw: '',
    userAddress: '',
    poolContract: ''
  }

  componentDidMount(props) {
    if(window.web3) {
      this.props.web3.eth.getAccounts().then(function(accounts) {
      this.setState({userAddress: accounts[0]});
    }.bind(this));
    this.setState({poolContract: this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress)})
    }
  }

  addStakeTx() { //called when "Add Stake" button is clicked

    const txParams = {
      gasPrice: 2,
      gas: 350000,
      to: QuarkChain.getEthAddressFromQkcAddress(this.props.poolAddress),
      value: this.state.add*1e18,
      fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
      toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
      networkId: 1
  }

  this.props.web3.qkc.sendTransaction(txParams, function(err,res) {
    console.log(err) //returns null or undefined
    console.log(res) //returns 0x0
    });
  }



  withdrawStake() { //called when "Withdraw" button is clicked

    const txParams = {
      gasPrice: 2,
      gas: 350000,
      fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
      toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress)
    }
    
    this.state.poolContract.withdrawStakes(this.state.withdraw, txParams).then(function(err, res) {
      console.log(err) //returns null or undefined
      console.log(res) //returns 0x0
    });
  }

  handleAddChange(event) {
    this.setState({add: event.target.value});
  }
  handleWithdrawChange(event) {
    this.setState({withdraw: event.target.value});
  }
  
  render() {
    if(window.ethereum) {
      return (
        <tbody>
            <tr className="rowcolour1">
              <td>Add Stake</td>
              <td>
                <input type="number" min="0" value={this.state.add} onChange={e => this.handleAddChange(e)} />
              </td>
              <td>
                <button type="button" onClick={this.addStakeTx.bind(this)}>Add Stake</button>
              </td>
            </tr>
            <tr className="rowcolour2">
              <td>Withdraw</td>
              <td>
                <input type="number" min="0" value={this.state.withdraw} onChange={e => this.handleWithdrawChange(e)} />
              </td>
              <td>
                <button onClick={this.withdrawStake.bind(this)}>Withdraw</button>
              </td>
            </tr>
        </tbody>
      )
    } else {
      return (
        <table>
          <tfoot>
            Please make sure that you have a web3 wallet installed in your browser
          </tfoot>
        </table>
      )
    }
  }
}

export {PoolInterface, Navbar};