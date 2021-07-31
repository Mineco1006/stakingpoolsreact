import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import React from 'react';
import axios from 'axios';
import {ABIinterface, jrpcUrl, admin, baseURL} from './config.js';
import {toast} from 'react-toastify';

let web3 = new Web3();
QuarkChain.injectWeb3(web3, jrpcUrl)

axios.defaults.baseURL = baseURL;

export default class MinerInterface extends React.Component {
    //minerName, web3, poolAddress, poolROIAddress, index

    state = {
        balance: 0,
        roi: 0,
        minStake: 0,
        poolStatus: "Open",
        minerFee: 0,
        poolFee: 0,
        snapshotdate: ''
    }
    componentDidMount(props) {
        axios.defaults.baseURL = baseURL;
        this.getContractInformation();
    }
        
    getContractInformation(){
        axios.post("/getContractInfo", {chainId: this.props.index}).then((response) => {
          const data = response.data;
          let status = data.isClosed ? "Closed" : "Open";

          axios.post("/getSnapshot", {chainId: this.props.index}).then(function(res){
            this.setState({balance: (data.balance/1e18).toFixed(2), roi: data.roiMon ?? 0, minStake: (data.minStake/1e18).toFixed(2), poolStatus: status, minerFee: (data.minerFee/1e2), poolFee: (data.poolFee/1e2), snapshotdate: String(new Date(Number(res.data.timestamp)))})
          }.bind(this));
            
    
          axios.post("/newROI", {chainId: this.props.index, roi: data.roiMon})
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
                        <td colSpan="2">{`${this.state.roi}% / ${(this.state.roi*12).toFixed(1)}%`}</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Total Stakes</td>
                        <td colSpan="2">{Number(this.state.balance).toLocaleString} QKC</td>
                    </tr>
                    <tr className="rowcolour2">
                        <td>Minimum Stake</td>
                        <td colSpan="2">{Number(this.state.minStake).toLocaleString} QKC</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Pool Status</td>
                        <td colSpan="2">{this.state.poolStatus}</td>
                    </tr>
                    <tr className="rowcolour2">
                        <td>Miner Fee</td>
                        <td colSpan="2">{this.state.minerFee}%</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Pool Fee</td>
                        <td colSpan="2">{this.state.poolFee}%</td>
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
          if(parseInt(res) != 0 && res != undefined && res != null) {
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
        
        this.state.poolContract.adjustMinerFee((this.state.minerFee*100).toFixed(0), txParams, function(err, res) {
            if(parseInt(res) != 0 && res != undefined && res != null) {
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
        
        this.state.poolContract.adjustPoolFee((this.state.poolFee*100).toFixed(0), txParams, function(err, res) {
            if(parseInt(res) != 0 && res != undefined && res != null) {
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
        
        this.state.poolContract.changePoolStatus(status, txParams, function(err, res) {
            if(parseInt(res) != 0 && res != undefined && res != null) {
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
            if(parseInt(res) != 0 && res != undefined && res != null) {
            toast.success(({closeToast}) => <div>Your <a href={`https://mainnet.quarkchain.io/tx/${res}`} target="_blank">pool fee adjustment</a> was sent successfully</div>) 
            } else {
            toast.warn("Seems that your transaction has been declined")
            }
        });
    }

    takeSnaphot() {
        this.props.web3.qkc.getBalance(this.props.poolAddress, function(err, res) {
            axios.post("/newSnapshot", {chainId: this.props.index, balance: res})
            toast.success(({closeToast}) => <div>New snapshot successfully queried to database</div>)
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
                            <button className="but" onClick={() => this.changePoolStatus(0)}>Open</button>
                        </td>
                        <td>
                            <button className="but" onClick={() => this.changePoolStatus(1)}>Close</button>
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