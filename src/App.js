import './App.css';
import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import {ABIinterface, roiABIinterface, poolROIContractAddress, poolContractAddress, fullShardKey, jrpcUrl, standardShardKeys} from './components/config';
import {PoolInterface, Navbar} from './components/siteComponents.js'
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

let web3 = new Web3()

if(window.ethereum){
  web3 = new Web3(web3.givenProvider);
  QuarkChain.injectWeb3(web3, jrpcUrl);
  window.ethereum.enable();
} else {
  web3 = new Web3(web3.currentProvider);
}

function App() {

  return (
    <div className="App">
      <header className="App-header">
          <Navbar/>
        <div className="container" style={{backgroundColor:'#202020'}}>
          <PoolInterface poolAddress={poolContractAddress[2] + fullShardKey[2]} poolROIAddress={poolROIContractAddress[2]+fullShardKey[2]} index="2" miner="@marcthemauler" web3={web3} />
          <PoolInterface poolAddress={poolContractAddress[3] + fullShardKey[3]} poolROIAddress={poolROIContractAddress[3]+fullShardKey[3]} index="3" miner="@bukum86" web3={web3}/> 
        </div>
      </header>
    </div>
  );
}

export default App;
