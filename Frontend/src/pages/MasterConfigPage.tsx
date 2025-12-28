import React from 'react';
import MasterConfigPanel from '../components/Panels/MasterConfigPanel';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppStore } from '../store/useAppStore';
import { playSound } from '../services/soundService';
import { SystemStatus } from '../types';

const MasterConfigPage: React.FC = () => {
  const {
    hardwareConfig,
    setHardwareConfig,
    strategyConfig,
    setStrategyConfig,
    riskConfig,
    setRiskConfig,
    secretConfig,
    setSecretConfig,
  } = useSettingsStore();

  const { setStatus, addLog, soundEnabled } = useAppStore();

  const handleApplyHw = () => {
    addLog('INFO', 'Hardware config updated');
    if (soundEnabled) playSound('click');
  };

  const handleApplyStrat = () => {
    console.log('--- DEPLOYING STRATEGY CONFIGURATION ---');
    console.log(strategyConfig);
    addLog(
      'INFO',
      `Strategy deployed: ${strategyConfig.model} [LiveTraining: ${strategyConfig.liveTraining ? 'ON' : 'OFF'}]`,
    );
    if (soundEnabled) playSound('click');
  };

  const handleApplyRisk = () => {
    addLog('INFO', 'Risk parameters updated');
    if (soundEnabled) playSound('click');
  };

  const handleApplySecrets = () => {
    addLog('ALERT', 'Secure Configuration Updated');
    if (soundEnabled) playSound('click');
  };

  const handleKillSwitch = () => {
    setStatus(SystemStatus.STOPPED);
    addLog('ALERT', 'Kill Switch Activated via Config');
  };

  return (
    <MasterConfigPanel
      hwConfig={hardwareConfig}
      setHwConfig={setHardwareConfig}
      stratConfig={strategyConfig}
      setStratConfig={setStrategyConfig}
      riskConfig={riskConfig}
      setRiskConfig={setRiskConfig}
      secretConfig={secretConfig}
      setSecretConfig={setSecretConfig}
      onKillSwitch={handleKillSwitch}
      onApplyHw={handleApplyHw}
      onApplyStrat={handleApplyStrat}
      onApplyRisk={handleApplyRisk}
      onApplySecrets={handleApplySecrets}
    />
  );
};

export default MasterConfigPage;
