import {poolROIContractAddress, poolContractAddress, fullShardKey} from '../components/config';
import React from 'react';
import MinerInterface from '../components/minerInterface';

//index 2

export default class Miner extends React.Component {

    componentDidMount(props){
    }
    //minerName, web3, poolAddress, poolROIAddress, index
    
    render(){
        return (
        <div className="container" style={{backgroundColor:'#202020'}}>
          <MinerInterface minerName="Marc" poolAddress={poolContractAddress[2] + fullShardKey[2]} index="2" web3={this.props.web3}/>
          <MinerInterface minerName="Bukum" poolAddress={poolContractAddress[3] + fullShardKey[3]} index="3" web3={this.props.web3}/>
          <MinerInterface minerName="Marc" poolAddress={poolContractAddress[7] + fullShardKey[7]} index="7" web3={this.props.web3}/>
        </div>
        )
    }
    
}