import React from 'react';
import { useParams } from 'react-router-dom';
import PlaceholderPanel from '../components/Panels/PlaceholderPanel';
import DataMiningPanel from '../components/Panels/DataMiningPanel';
import LiquidityPanel from '../components/Panels/LiquidityPanel';
import FeatureEngineeringPanel from '../components/Panels/FeatureEngineeringPanel';
import SentimentPanel from '../components/Panels/SentimentPanel';
import NeuralNetPanel from '../components/Panels/NeuralNetPanel';
import DecisionEnginePanel from '../components/Panels/DecisionEnginePanel';
import RiskManagementPanel from '../components/Panels/RiskManagementPanel';
import ExecutionPanel from '../components/Panels/ExecutionPanel';
import BacktestingPanel from '../components/Panels/BacktestingPanel';
import DeploymentPanel from '../components/Panels/DeploymentPanel';
import AdvancedOpsPanel from '../components/Panels/AdvancedOpsPanel';
import RustTransformationPanel from '../components/Panels/RustTransformationPanel';
import HiddenStepsPanel from '../components/Panels/HiddenStepsPanel';

const ModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();

  switch (moduleId) {
    case 'datamining':
      return <DataMiningPanel />;
    case 'liquidity':
      return <LiquidityPanel />;
    case 'feature_engineering':
      return <FeatureEngineeringPanel />;
    case 'sentiment':
      return <SentimentPanel />;
    case 'neural_net':
      return <NeuralNetPanel />;
    case 'decision_engine':
      return <DecisionEnginePanel />;
    case 'risk_engine':
      return <RiskManagementPanel />;
    case 'execution_engine':
      return <ExecutionPanel />;
    case 'backtesting':
      return <BacktestingPanel />;
    case 'deployment':
      return <DeploymentPanel />;
    case 'advanced_ops':
      return <AdvancedOpsPanel />;
    case 'rust_core':
      return <RustTransformationPanel />;
    case 'hidden_steps':
      return <HiddenStepsPanel />;
    default:
      return <PlaceholderPanel moduleId={moduleId || 'unknown'} />;
  }
};

export default ModulePage;
