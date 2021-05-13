import QuarkChain from 'quarkchain-web3';
import React from 'react';
import axios from 'axios';
import {ABIinterface, standardShardKeys} from './config.js'
import {toast} from 'react-toastify';

class PoolUserInterface extends React.Component {
    //poolAddress, web3, index
  
    state={
      userAddress: '',
      stake: ''
    }
  
    getUserStake() {
      const poolContract = this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress);
      let stake
    
      poolContract.getStakesWithRewards(this.state.userAddress, {from: this.state.userAddress}, function(err, res){
        stake = Number((res/10**18).toFixed(2)).toLocaleString() + " QKC"
        this.setState({stake: stake})
      }.bind(this));
    }
  
    componentDidMount(props) {
      if(window.web3) {
        this.props.web3.eth.getAccounts().then(function(accounts) {
        this.setState({userAddress: accounts[0]})
        this.getUserStake()
      }.bind(this))
  
      
      }
    }
  
    render() {
      if(window.web3){
        return (
          <tbody>
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
                Your Chain {this.props.index} Pool Stake
              </td>
              <td colSpan="2">
                {this.state.stake}
              </td>
            </tr>
          </tbody>
          
      )
      }else{
        return (
          <tbody>
            <tr className="rowcolour1">
              <td colSpan="2">
                Please enable your web3 wallet to check your stake
              </td>
            </tr>
          </tbody>
        )
      }
      
    }
  }
  
  
  
  class PoolAllocateAndWithdraw extends React.Component {
    //poolAddress, web3, index
  
    state = {
      add: '',
      withdraw: '',

      userAddress: '',
      poolContract: '',
      userBalance: '',
      userBalanceNum: '',
      stake: ''
    }

    getUserStake() {
      const poolContract = this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress);
      let stake
    
      poolContract.getStakesWithRewards(this.state.userAddress, {from: this.state.userAddress}, function(err, res){
        stake = res/1e18
        this.setState({stake: stake})
      }.bind(this));
    }
  
    componentDidMount(props) {
      if(window.web3) {
        this.props.web3.eth.getAccounts().then(function(accounts) {
        this.setState({userAddress: accounts[0]});
        this.props.web3.qkc.getBalance(this.state.userAddress + standardShardKeys[this.props.index], function(err, res){
          const result = Number((res/1e18).toFixed(2)).toLocaleString() + " QKC";
          const resultNum = res/1e18
          this.setState({userBalance: result, userBalanceNum: resultNum})
        }.bind(this));
      }.bind(this));
      this.setState({poolContract: this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress)})
      this.getUserStake()
      }
    }
  
    addStakeTx() { //called when "Add Stake" button is clicked

      if(this.state.add > this.state.userBalanceNum) {
        toast.warn(`Insufficent funds on chain ${this.props.index}`)
        return
      }
  
      const txParams = {
        gasPrice: 2e9,
        gas: 350000,
        to: QuarkChain.getEthAddressFromQkcAddress(this.props.poolAddress),
        value: this.state.add*1e18,
        fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        networkId: 1
    }
    this.props.web3.qkc.sendTransaction(txParams, function(err,res) {
      if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
        toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">transaction</a> was sent successfully</div>)
        this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
          axios.post("http://qkcstakingpools.xyz:3001/api/newSnapshot", {chainId: this.props.index, balance: (res+(this.state.add*1e18))})
        });
      } else {
        toast.warn("Seems that your transaction has been declined")
      }
      });
         
    }
  
  
  
    withdrawStake() { //called when "Withdraw" button is clicked

      if(this.state.withdraw > this.state.stake) {
        toast.warn(`Insufficent stake on chain ${this.props.index} pool`)
        return
      }
  
      const txParams = {
        gasPrice: 2e9,
        gas: 350000,
        fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        networkId: 1
      }

      const value = this.state.withdraw*1e18
      
      this.state.poolContract.withdrawStakes(value, txParams, function(err, res) {
        if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
          toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">withdrawal</a> was sent successfully</div>) 
          this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
            axios.post("http://qkcstakingpools.xyz:3001/api/newSnapshot", {chainId: this.props.index, balance: (res-(this.state.withdraw*1e18))})
          }.bind(this));
        } else {
          toast.warn("Seems that your transaction has been declined")
        }
      }.bind(this));
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
                <td>Your Chain {this.props.index} Balance</td>
                <td colSpan="2">{this.state.userBalance}</td>
              </tr>
              <tr className="rowcolour2">
                <td>Deposit</td>
                <td>
                  <input className="inp" type="number" min="0" max={this.state.userBalance} placeholder="e.g. 50000" value={this.state.add} onChange={e => this.handleAddChange(e)} />
                </td>
                <td>
                  <button className="but" onClick={this.addStakeTx.bind(this)}>Deposit</button>
                </td>
              </tr>
              <tr className="rowcolour1">
                <td>Withdraw</td>
                <td>
                  <input className="inp" type="number" min="0" max={this.state.stake} placeholder="e.g. 50000" value={this.state.withdraw} onChange={e => this.handleWithdrawChange(e)} />
                </td>
                <td>
                  <button className="but" onClick={this.withdrawStake.bind(this)}>Withdraw</button>
                </td>
              </tr>
          </tbody>
        )
      } else {
        return (
          null
        )
      }
    }
  }

export {PoolUserInterface, PoolAllocateAndWithdraw};