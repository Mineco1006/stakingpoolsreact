import React from 'react';
import ROICalculatorComp from '../components/roiCalculator';

//index 3

export default class ROICalculator extends React.Component {

    componentDidMount(props){
    }
    
    render(){
        return (
        <div className="container" style={{backgroundColor:'#202020'}}>
          <ROICalculatorComp web3={this.props.web}/>
        </div>
        )
    }
    
}