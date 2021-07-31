import React from 'react';
import {Link} from 'react-router-dom';

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

export {Navbar};