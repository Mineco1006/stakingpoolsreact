import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import React from 'react';
import {jrpcUrl} from './config.js';
import {PoolUserInterface} from './userInterface';
import axios from 'axios';

let web3 = new Web3();
QuarkChain.injectWeb3(web3, jrpcUrl);

axios.defaults.baseURL = "https://qkcstakingpools.xyz:500/api";

class PoolInterface extends React.Component {
  // poolAddress, index, miner, web3

  

  state = {
    balance : 0,
    roi : 0,
    minStake : 0,
    poolStatus : "Open"
  }

  getContractInformation(){
    axios.post("/getContractInfo", {chainId: this.props.index}).then((response) => {
      if(response.data == undefined){
        return
      }
      const data = response.data;
      let status = data.isClosed ? "Closed" : "Open";

      this.setState({balance: (data.balance/1e18).toFixed(2), roi: data.roiMon, minStake: (data.minStake/1e18).toFixed(2).toLocaleString(), poolStatus: status})

      axios.post("/newROI", {chainId: this.props.index, roi: data.roiMon})
    });
  }

  componentDidMount(props) {
    this.getContractInformation()
  }

  render() {
    
    return (
      <table className="pool">
        <thead>
          <tr className="rowcolour1">
                <th colSpan="3">
                  <a href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress} target="_blank" className="href">Chain {this.props.index} Pool</a>
                </th>
          </tr>
        </thead>
        <tbody>
            <tr className="rowcolour2">
                <td>Estimated ROI Monthly/Annually</td>
                <td colSpan="2">{`${this.state.roi}% / ${(this.state.roi*12).toFixed(1)}%`}</td>
            </tr>
            <tr className="rowcolour1">
                <td>Total Stakes</td>
                <td colSpan="2">{(this.state.balance).toLocaleString()} QKC</td>
            </tr>
            <tr className="rowcolour2">
                <td>Minimum Stake</td>
                <td colSpan="2">{this.state.minStake} QKC</td>
            </tr>
            <tr className="rowcolour1">
                <td>Pool Status</td>
                <td colSpan="2">{this.state.poolStatus}</td>
            </tr>
            <tr className="rowcolour2">
              <td>Miner</td>
              <td colSpan="2">{this.props.miner}</td>
            </tr>
        </tbody>
        <PoolUserInterface poolAddress={this.props.poolAddress} web3={this.props.web3} index={this.props.index}/>
      </table>
      
    )
  }
}

export {PoolInterface};