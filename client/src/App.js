import './App.css';
import Web3 from 'web3';
import QuarkChain from 'quarkchain-web3';
import {jrpcUrl} from './components/config';

import React from 'react';
import {Route, HashRouter as Router, Switch} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import Home from './routes/Home';
import Miner from './routes/Miner';
import ROICalculator from './routes/ROICalculator';

import {Navbar} from './components/topAndBottomNav';

let web3 = new Web3()
QuarkChain.injectWeb3(web3, jrpcUrl);

if(window.ethereum){
    web3 = new Web3(window.ethereum);
    QuarkChain.injectWeb3(web3, jrpcUrl);
    window.ethereum.enable();
  }

function App() {
  
    return (
      <Router>
        <div className="App">
          <header className="App-header">
              <Navbar/>
              <ToastContainer/>
          </header>
          <Switch>
            <Route exact path="/">
              <Home web3={web3}/>
            </Route>
            <Route exact path="/manage">
              <Miner web3={web3}/>
            </Route>
            <Route exact route="/roicalc">
              <ROICalculator/>
            </Route>
          </Switch>
           
        </div>
      </Router>
    );
}

export default App;
