import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import React from 'react';
import axios from 'axios';
import {ABIinterface, roiABIinterface, jrpcUrl, blockAllowance, admin} from './config.js';
import {toast} from 'react-toastify';

let web3 = new Web3();
QuarkChain.injectWeb3(web3, jrpcUrl)

export default class MinerInterface extends React.Component {
    //minerName, web3, poolAddress, poolROIAddress, index

    state = {
        balance: '',
        roi: '',
        minStake: '',
        poolStatus: '',
        minerFee: '',
        poolFee: '',
        snapshotdate: ''
    }
    componentDidMount(props) {
        this.getContractInformation();
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
          this.setState({balance: v1})
        }.bind(this));
      
        poolContract.minerFee.call(function(err, res){
          minerFee = res/10000
          v2 = res/100+"%";
          this.setState({minerFee: v2})
        }.bind(this));
        poolContract.poolFee.call(function(err, res){
          poolFee = res/10000
          v3 = res/100+"%";
          this.setState({poolFee: v3})
        }.bind(this));
    
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
                let date = new Date(Number(data.timestamp))
                v7 = date.toUTCString()
                this.setState({roi: v6});
                this.setState({snapshotdate: v7})

                axios.post("http://qkcstakingpools.xyz:3001/api/newROI", {chainId: this.props.index, roi: result})
            }.bind(this));
        });
      }

    
    render() {
        return (
            <table className="pool">
                <thead>
                <tr className="rowcolour1" href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress}>
                        <th colSpan="3">
                        <a href={"https://mainnet.quarkchain.io/address/" + this.props.poolAddress} target="_blank" className="href">{this.props.minerName}'s Chain {this.props.index} Pool</a>
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
                        <td>Miner Fee</td>
                        <td colSpan="2">{this.state.minerFee}</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Pool Fee</td>
                        <td colSpan="2">{this.state.poolFee}</td>
                    </tr>
                    <tr className="rowcolour2">
                        <td>Last Snapshot Date</td>
                        <td colSpan="2">{this.state.snapshotdate}</td>
                    </tr>
                </tbody>
                <MinerChangeInterface poolAddress={this.props.poolAddress} minerName={this.props.minerName} web3={this.props.web3} index={this.props.index}/>
            </table>
        )
    }
}

class MinerChangeInterface extends React.Component {
    state= {
        minStake: '',
        minerFee: '',
        poolFee: '',
        poolContract: '',
        userAddress: ''
    }

    componentDidMount(props) {
        this.setState({poolContract: this.props.web3.qkc.contract(ABIinterface).at(this.props.poolAddress)})
        if(window.ethereum){
            this.props.web3.eth.getAccounts().then(function(accounts) {
                this.setState({userAddress: accounts[0]})
            }.bind(this))
        }
        
    }

    handleMinStakeChange(event) {
        this.setState({minStake: event.target.value});
    }

    handleMinerFeeChange(event) {
        this.setState({minerFee: event.target.value});
    }

    handlePoolFeeChange(event) {
        this.setState({poolFee: event.target.value});
    }

    adjustMinStake() { //called when "Withdraw" button is clicked
  
        const txParams = {
          gasPrice: 2e9,
          gas: 350000,
          fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
          toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
          networkId: 1
        }
        
        this.state.poolContract.adjustMinStake((this.state.minStake*1e18), txParams, function(err, res) {
            console.log(res)
          if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
            toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">min stake adjustment</a> was sent successfully</div>) 
          } else {
            toast.warn("Seems that your transaction has been declined")
          }
        });
      }

    adjustMinerFee() { //called when "Withdraw" button is clicked

        const txParams = {
            gasPrice: 2e9,
            gas: 350000,
            fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            networkId: 1
        }
        
        this.state.poolContract.adjustMinerFee((this.state.minerFee*100).toFixed(2), txParams, function(err, res) {
            if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
            toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">miner fee adjustment</a> was sent successfully</div>) 
            } else {
            toast.warn("Seems that your transaction has been declined")
            }
        });
    }

    adjustPoolFee() { //called when "Withdraw" button is clicked

        const txParams = {
            gasPrice: 2e9,
            gas: 350000,
            fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            networkId: 1
        }
        
        this.state.poolContract.adjustPoolFee((this.state.poolFee).toFixed(2)*100, txParams, function(err, res) {
            if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
            toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">pool fee adjustment</a> was sent successfully</div>) 
            } else {
            toast.warn("Seems that your transaction has been declined")
            }
        });
    }

    changePoolStatus(status) { //called when "Withdraw" button is clicked

        const txParams = {
            gasPrice: 2e9,
            gas: 350000,
            fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            networkId: 1
        }
        
        this.state.poolContract.adjustPoolFee(status, txParams, function(err, res) {
            if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
            toast.success(({ closeToast }) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">pool fee adjustment</a> was sent successfully</div>) 
            } else {
            toast.warn("Seems that your transaction has been declined")
            }
        });
    }

    flushContract() { //called when "Withdraw" button is clicked

        const txParams = {
            gasPrice: 2e9,
            gas: 6000000,
            fromFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            toFullShardKey: QuarkChain.getFullShardKeyFromQkcAddress(this.props.poolAddress),
            networkId: 1
        }
        
        this.state.poolContract.flushContract(txParams, function(err, res) {
            if(res != "0x000000000000000000000000000000000000000000000000000000000000000000000000" && res != undefined && res != null) {
            toast.success(() => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">pool fee adjustment</a> was sent successfully</div>) 
            } else {
            toast.warn("Seems that your transaction has been declined")
            }
        });
    }

    takeSnaphot() {
        this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
            axios.post("http://qkcstakingpools.xyz:3001/api/newSnapshot", {chainId: this.props.index, balance: res}).then(function(err,res){
                toast.success(() => <div>New snapshot successfully queried to database</div>)
            }.bind(this));
        }.bind(this))
    }

    render() {
        if(this.state.userAddress != admin[0] && this.state.userAddress != admin[1] && this.state.userAddress != admin[2]){
            
        return(
                <tbody>
                    <tr className="rowcolour1">
                        <td colSpan="2">Please connect with a valid admin account</td>
                    </tr>
                </tbody>
            )
        } else {
            return(
                <tbody>
                    <tr className="rowcolour1">
                        <td colSpan="3">
                            <button className="but" onClick={this.takeSnaphot.bind(this)}>Take New Snapshot</button>
                        </td>
                    </tr>
                    <tr className="rowcolour2">
                        <td>Adjust Miner Fee ({this.props.minerName})</td>
                        <td>
                            <input className="inp" type="number" min="0" max= "100" placeholder="% value up to 2 decimals" value={this.state.minerFee} onChange={e => this.handleMinerFeeChange(e)} />
                        </td>
                        <td>
                            <button className="but" onClick={this.adjustMinerFee.bind(this)}>Change</button>
                        </td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Adjust Minimum Stake (Nico)</td>
                        <td>
                            <input className="inp" type="number" min="0" placeholder="minStake in QKC" value={this.state.minStake} onChange={e => this.handleMinStakeChange(e)} />
                        </td>
                        <td>
                            <button className="but" onClick={this.adjustMinStake.bind(this)}>Change</button>
                        </td>
                    </tr>
                    <tr className="rowcolour2">
                        <td>Adjust Pool Fee(Nico)</td>
                        <td>
                            <input className="inp" type="number" min="0" max= "100" placeholder="% value up to 2 decimals" value={this.state.poolFee} onChange={e => this.handlePoolFeeChange(e)} />
                        </td>
                        <td>
                            <button className="but" onClick={this.adjustPoolFee.bind(this)}>Change</button>
                        </td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Open/Close Pool Allocations (Nico)</td>
                        <td>
                            <button className="but" onClick={() => this.changePoolStatus(false)}>Open</button>
                        </td>
                        <td>
                            <button className="but" onClick={() => this.changePoolStatus(true)}>Close</button>
                        </td>
                    </tr>
                    <tr className="rowcolour2">
                        <td colSpan="3">
                            <button className="but" onClick={this.flushContract.bind(this)}>Flush Contract(Nico)</button>
                        </td>
                    </tr>
                </tbody>
        )
        }
    }
}