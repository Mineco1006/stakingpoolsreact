import axios from "axios";
import React from "react";
import Decimal from "decimal";

axios.defaults.baseURL = "https://qkcstakingpools.xyz:500/api";

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
        axios.post("/getLatestROI", {chainId: 2}).then((response)=>{
            const data = response.data;
            this.setState({chain2roi: new Decimal(data.roi/100)})
        });
        axios.post("/getLatestROI", {chainId: 3}).then((response)=>{
            const data = response.data;
            this.setState({chain3roi: new Decimal(data.roi/100)})
        });
        axios.post("/getLatestROI", {chainId: 7}).then((response)=>{
            const data = response.data;
            this.setState({chain7roi: new Decimal(data.roi/100)})
        });
    }

    handleChange(event) {
        console.log(new Decimal(this.state.chain2roi).add(new Decimal(2.344)));
        const val1 = Number(new Decimal(event.target.value).mul(this.state.chain2roi));
        const val2 = Number(new Decimal(event.target.value).mul(this.state.chain3roi));
        const val3 = Number(new Decimal(event.target.value).mul(this.state.chain3roi));
        this.setState({chain2value: val1, chain3value: val2, chain7value: val3});
    }

    render() {
        return(
            <table className="pool">
                <tbody>
                    <tr className="rowcolour1">
                        <td colSpan="3">ROI Calculator</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td colSpan="3"><input type="number" min="0" className="inp" placeholder="Enter Amount In QKC" onChange={e => this.handleChange(e)}/></td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Pool</td>
                        <td>Monthly Reward</td>
                        <td>Annual Reward</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Chain 2</td>
                        <td>{this.state.chain2value} QKC</td>
                        <td>{(this.state.chain2value*12).toFixed(1)} QKC</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Chain 3</td>
                        <td>{this.state.chain3value} QKC</td>
                        <td>{(this.state.chain3value*12).toFixed(1)} QKC</td>
                    </tr>
                    <tr className="rowcolour1">
                        <td>Chain 7</td>
                        <td>{this.state.chain7value} QKC</td>
                        <td>{(this.state.chain7value*12).toFixed(1)} QKC</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}