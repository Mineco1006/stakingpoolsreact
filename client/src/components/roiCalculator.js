import axios from 'axios';
import React from 'react';

export default class ROICalculatorComp extends React.Component {

    state={
        chain2roi: '',
        chain3roi: '',
        chain7roi: '',

        chain2value: 0,
        chain3value: 0,
        chain7value: 0,
    }

    componentDidMount() {
        this.getROI()
    }

    getROI() {
        axios.post("http://qkcstakingpools.xyz:3001/api/getLatestROI", {chainId: 2}).then((response)=>{
            const data = response.data;
            this.setState({chain2roi: data.roi/100})
        });
        axios.post("http://qkcstakingpools.xyz:3001/api/getLatestROI", {chainId: 3}).then((response)=>{
            const data = response.data;
            this.setState({chain3roi: data.roi/100})
        });
    }

    handleChange(event) {
        const val1 = (event.target.value*this.state.chain2roi).toFixed(3);
        const val2 = (event.target.value*this.state.chain3roi).toFixed(3);
        this.setState({chain2value: val1, chain3value: val2})
    }

    render() {
        return(
            <table>
                <tbody>
                    <tr>
                        <td colSpan="3">ROI Calculator</td>
                    </tr>
                    <tr>
                        <td colSpan="3"><input className="inp" onChange={e => this.handleChange(e)}/></td>
                    </tr>
                    <tr>
                        <td>Pool</td>
                        <td>Monthly Reward</td>
                        <td>Annual Reward</td>
                    </tr>
                    <tr>
                        <td>Chain 2</td>
                        <td>{this.state.chain2value} QKC</td>
                        <td>{(this.state.chain2value*12).toFixed(1)} QKC</td>
                    </tr>
                    <tr>
                        <td>Chain 3</td>
                        <td>{this.state.chain3value} QKC</td>
                        <td>{(this.state.chain3value*12).toFixed(1)} QKC</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}