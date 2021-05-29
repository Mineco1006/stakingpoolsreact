import QuarkChain from 'quarkchain-web3';
import React from 'react';
import axios from 'axios';
import {ABIinterface, standardShardKeys} from './config.js';
import {toast} from 'react-toastify';

axios.defaults.baseURL = "https://qkcstakingpools.xyz:500/api";

  class PoolUserInterface extends React.Component {
    //poolAddress, web3, index
  
    state = {
      add: '',
      withdraw: '',

      userAddress: '',
      poolContract: '',

      userBalance: 0,
      stake: 0
    }

    componentDidMount(props) {
      if(window.web3) {
        this.props.web3.eth.getAccounts().then(function(accounts) {
          console.log(this.props.web3.eth.accounts[0])
        this.setState({userAddress: accounts[0], poolContract: this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress)});
        if(!!this.props.web3.currentProvider.isQpocket){
          this.setState({userAddress: this.props.web3.givenProvider.address});
        }
          axios.post("/getUserInformation", {address: (this.state.userAddress+standardShardKeys[this.props.index]), chainId: this.props.index}).then(function(resolve){
            this.setState({stake: (resolve.data.stake*1e-18).toFixed(2), userBalance: (resolve.data.balance*1e-18).toFixed(2)})
            
          }.bind(this));
        }.bind(this));
      }
    }
  
    addStakeTx() { //called when "Add Stake" button is clicked

      if(this.state.add > this.state.userBalance) {
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
      if(parseInt(res) != 0 && res != undefined && res != null) {
        toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">transaction</a> was sent successfully</div>)
        this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, result) {
          const balance = (Number(result)+(this.state.add*1e18))
          axios.post("/newSnapshot", {chainId: this.props.index, balance: balance})
          axios.post("/logTx", {address: this.state.userAddress, chainId: this.props.index, type: "deposit", amount: this.state.add, txId: res})
        }.bind(this));
      } else {
        toast.warn("Seems that your transaction has been declined")
        }
      }.bind(this));
         
    }
  
  
  
    withdrawStake() { //called when "Withdraw" button is clicked

      if(this.state.withdraw > this.state.stake) {
        toast.warn(`Insufficent stake on chain ${this.props.index} pool`)
        return
      }

      const contract = new this.props.web3.eth.Contract(ABIinterface)
  
      const txParams = {
        gasPrice: 2e9,
        gasLimit: 350000,
        to: QuarkChain.getEthAddressFromQkcAddress(this.props.poolAddress),
        fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
        networkId: 1
      }
      
      this.state.poolContract.withdrawStakes((this.state.withdraw*1e18), txParams, function(err, res){
        if(parseInt(res) != 0 && res != undefined && res != null) {
          toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">transaction</a> was sent successfully</div>)
          this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, result) {
            const balance = (Number(result)-(this.state.withdraw*1e18))
            axios.post("/newSnapshot", {chainId: this.props.index, balance: balance})
            axios.post("/logTx", {address: this.state.userAddress, chainId: this.props.index, type: "withdrawal", amount: this.state.withdraw, txId: res})
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
      if(window.web3) {
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
                  {(this.state.stake).toLocaleString()}
                </td>
              </tr>
              <tr className="rowcolour1">
                <td>Your Chain {this.props.index} Balance</td>
                <td colSpan="2">{(this.state.userBalance).toLocaleString()}</td>
              </tr>
              <tr className="rowcolour2">
                <td>Deposit</td>
                <td>
                  <input className="inp" type="number" min="0" max={this.state.userBalance} placeholder={`Deposit Value To Chain ${this.props.index} Pool In QKC`} value={this.state.add} onChange={e => this.handleAddChange(e)} />
                </td>
                <td>
                  <button className="but" onClick={this.addStakeTx.bind(this)}>Deposit</button>
                </td>
              </tr>
              <tr className="rowcolour1">
                <td>Withdraw</td>
                <td>
                  <input className="inp" type="number" min="0" max={this.state.stake} placeholder={`Withdrawal Value From Chain ${this.props.index} Pool In QKC`} value={this.state.withdraw} onChange={e => this.handleWithdrawChange(e)} />
                </td>
                <td>
                  <button className="but" onClick={this.withdrawStake.bind(this)}>Withdraw</button>
                </td>
              </tr>
          </tbody>
        )
      } else {
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

export {PoolUserInterface};