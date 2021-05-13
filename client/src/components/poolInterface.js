import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import React from 'react';
import {ABIinterface, roiABIinterface, jrpcUrl, blockAllowance} from './config.js'
import {PoolUserInterface, PoolAllocateAndWithdraw} from './userInterface';
import {Link} from 'react-router-dom';
import axios from 'axios';

let web3 = new Web3();
QuarkChain.injectWeb3(web3, jrpcUrl)

class Navbar extends React.Component {
  componentDidMount() {
    document.title = "QKC Staking Pools"
  }

  render() {
    return(
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{marginBottom:'25px'}}>
          <div className="container-fluid">

            <a className="navbar-brand" href="https://qkcstakingpools.xyz/">QuarkChain Staking Pools</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Stats</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/roicalc">ROI Calculator</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="https://t.me/joinchat/ar58V6PuG5tkM2Y0" target="_blank" rel="noreferrer">Telegram</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="https://plakolm1006.medium.com/" target="_blank" rel="noreferrer">News</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="https://twitter.com/Quark_Chain" target="_blank" rel="noreferrer">Twitter</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
    )
  }
}

class PoolInterface extends React.Component {
  // poolAddress, poolROIAddress, index, miner, web3

  state = {
    balance : '',
    balanceNum: '',
    roi : '',
    minStake : '',
    poolStatus : ''
  }

  getContractInformation() {
    const roiContract = web3.qkc.contract(roiABIinterface).at(this.props.poolROIAddress);
    const poolContract = web3.qkc.contract(ABIinterface).at(this.props.poolAddress);
    let minerFee;
    let poolFee;
  
    let v1;
    let v2;
    let v3;
    let v4;
    let v5;
    let v6;
    let v7;
  
    web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
      v1 = Number((res/10**18).toFixed(2)).toLocaleString() + " QKC";
      v7 = res
      this.setState({balance: v1})
    }.bind(this));
  
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
      this.setState({minStake: v4})
    }.bind(this));
  
    poolContract.isClosed.call(function(err, res){
        if(res == false){
          v5 = "Open";
        }
        if(res == true){  
          v5 = "Closed";
        }
        this.setState({poolStatus: v5})
    }.bind(this));

  
    axios.post("http://qkcstakingpools.xyz:3001/api/getSnapshot", {chainId: this.props.index}).then((response) => {
      const data = response.data;
      
      web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
        const result = ((((res-Number(data.balance))/((Number(data.balance)/blockAllowance[this.props.index]).toFixed(0)*blockAllowance[this.props.index]))/((Date.now()-Number(data.timestamp))))*(1000*3600*24*30)*(1-(minerFee+poolFee))*100).toFixed(3);
        v6 = result + "% / " + (result*12).toFixed(1) + "%";
        this.setState({roi: v6});

        axios.post("http://qkcstakingpools.xyz:3001/api/newROI", {chainId: this.props.index, roi: result})
      }.bind(this));
    });
  }

  componentDidMount(props) {
    this.getContractInformation()
  }

  render() {
    
    return (
      <table className="pool">
        <thead>
          <tr className="rowcolour1" href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress}>
                <th colSpan="3">
                  <a href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress} target="_blank" className="href">Chain {this.props.index} Pool</a>
                </th>
          </tr>
        </thead>
        <tbody>
            <tr className="rowcolour2">
                <td>Estimated ROI monthly/annual</td>
                <td colSpan="2">{this.state.roi}</td>
            </tr>
            <tr className="rowcolour1">
                <td>Total Stakes</td>
                <td colSpan="2">{this.state.balance}</td>
            </tr>
            <tr className="rowcolour2">
                <td>Minimum Stake</td>
                <td colSpan="2">{this.state.minStake}</td>
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
        <PoolAllocateAndWithdraw poolAddress={this.props.poolAddress} web3={this.props.web3} index={this.props.index}/>
      </table>
      
    )
  }
}

export {PoolInterface, Navbar};