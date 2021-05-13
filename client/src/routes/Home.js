import {poolROIContractAddress, poolContractAddress, fullShardKey} from '../components/config';
import {PoolInterface} from '../components/poolInterface';
import React from 'react';

//index 1

export default class Home extends React.Component {

    componentDidMount(props){

    }
    
    render(){
        return (
        <div className="container" style={{backgroundColor:'#202020'}}>
          <PoolInterface poolAddress={poolContractAddress[2] + fullShardKey[2]} poolROIAddress={poolROIContractAddress[2]+fullShardKey[2]} index="2" miner="@marcthemauler" web3={this.props.web3} />
          <PoolInterface poolAddress={poolContractAddress[3] + fullShardKey[3]} poolROIAddress={poolROIContractAddress[3]+fullShardKey[3]} index="3" miner="@bukum86" web3={this.props.web3}/>
        </div>
        )
    }
    
}