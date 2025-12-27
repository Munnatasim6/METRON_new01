import React from 'react';
import StrategyCommand from '../components/StrategyCommand';
import SEO from '../components/common/SEO';

const StrategyPage: React.FC = () => {
    return (
        <>
            <SEO title="Strategy Command" description="MetronBot Mission Control - Strategy, Risk, and Backtesting" />
            <StrategyCommand />
        </>
    );
};

export default StrategyPage;
