import React, { useState, useEffect } from 'react';
import {
  Network,
  Cpu,
  Layers,
  Zap,
  GitBranch,
  Save,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Target,
  Box,
  BrainCircuit,
  Settings,
  Dna,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

type Tab = 'ARCHITECTURE' | 'TRAINING' | 'EVALUATION' | 'RL_AGENT';

const NeuralNetPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ARCHITECTURE');
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);

  // Mock Data
  const [lossData, setLossData] = useState<any[]>([]);
  const [gpuTemp, setGpuTemp] = useState(45);

  // Architecture State
  const [layers, setLayers] = useState([
    { id: 1, type: 'Input (Multi-TF)', nodes: 128, status: 'active' },
    { id: 2, type: 'LSTM Layer', nodes: 256, status: 'active' },
    { id: 3, type: 'Dropout (0.2)', nodes: 0, status: 'passive' },
    { id: 4, type: 'Transformer (Attn)', nodes: 512, status: 'active' },
    { id: 5, type: 'Dense (Output)', nodes: 3, status: 'active' },
  ]);

  useEffect(() => {
    let interval: any;
    if (isTraining) {
      interval = setInterval(() => {
        setEpoch((prev) => prev + 1);
        setLossData((prev) => {
          const newLoss = Math.max(
            0.01,
            (prev.length > 0 ? prev[prev.length - 1].loss : 0.8) * 0.98 +
              (Math.random() * 0.05 - 0.025),
          );
          const newValLoss = Math.max(0.02, newLoss + 0.05 + Math.random() * 0.02);
          const newData = [
            ...prev,
            { epoch: prev.length + 1, loss: newLoss, val_loss: newValLoss },
          ].slice(-50);
          return newData;
        });
        setGpuTemp((prev) => Math.min(85, Math.max(40, prev + (Math.random() * 5 - 2))));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-600/10 rounded-lg'>
              <BrainCircuit className='text-purple-400' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>NEURAL NETWORK DESIGN</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 5: Deep Learning Architecture & Training
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800'>
            {['ARCHITECTURE', 'TRAINING', 'EVALUATION', 'RL_AGENT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2
                            ${
                              activeTab === tab
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
              >
                {tab === 'ARCHITECTURE' && <Layers size={12} />}
                {tab === 'TRAINING' && <Zap size={12} />}
                {tab === 'EVALUATION' && <Target size={12} />}
                {tab === 'RL_AGENT' && <Dna size={12} />}
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar pr-2'>
        {/* --- TAB 1: ARCHITECTURE --- */}
        {activeTab === 'ARCHITECTURE' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. VISUAL LAYER BUILDER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-1'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Network size={16} className='text-purple-400' /> Model Topology
              </h3>
              <div className='space-y-2 relative'>
                {/* Connecting Line */}
                <div className='absolute left-6 top-4 bottom-4 w-0.5 bg-gray-800 z-0'></div>

                {layers.map((layer, i) => (
                  <div
                    key={layer.id}
                    className='relative z-10 flex items-center gap-4 bg-gray-950 p-3 rounded border border-gray-800 hover:border-purple-500/50 transition-colors group cursor-pointer'
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${layer.type.includes('Input') ? 'border-green-500 bg-green-500/10 text-green-400' : layer.type.includes('Output') ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-blue-500 bg-blue-500/10 text-blue-400'}`}
                    >
                      {i + 1}
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-bold text-gray-200'>{layer.type}</div>
                      <div className='text-[10px] text-gray-500 font-mono'>
                        {layer.nodes > 0 ? `Nodes: ${layer.nodes} | Activation: ReLU` : 'Rate: 0.2'}
                      </div>
                    </div>
                    <Settings
                      size={14}
                      className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'
                    />
                  </div>
                ))}

                <button className='w-full py-2 border-2 border-dashed border-gray-800 rounded text-gray-500 text-xs font-mono hover:border-gray-600 hover:text-gray-300 transition-colors mt-4'>
                  + ADD LAYER
                </button>
              </div>
            </div>

            {/* 2. CONFIGURATION DETAILS */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Multi-Timeframe Inputs */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Layers size={16} className='text-yellow-400' /> Multi-Timeframe Input Layer
                </h3>
                <div className='grid grid-cols-3 gap-4'>
                  {['1m (Micro)', '15m (Trend)', '4H (Macro)'].map((tf, i) => (
                    <div
                      key={tf}
                      className='bg-gray-950 p-4 rounded border border-gray-800 flex flex-col items-center text-center'
                    >
                      <div className='text-xs text-gray-500 font-mono mb-2'>{tf} Features</div>
                      <div className='flex gap-1 mb-2'>
                        {[1, 2, 3, 4].map((b) => (
                          <div
                            key={b}
                            className='w-1 h-4 bg-yellow-500/50 rounded-full animate-pulse'
                          ></div>
                        ))}
                      </div>
                      <div className='text-[10px] text-gray-400'>OHLCV + RSI + Vol</div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 p-3 bg-gray-800/50 rounded border border-gray-700 flex items-center gap-3'>
                  <Activity size={16} className='text-green-400' />
                  <div className='text-xs text-gray-300'>
                    <span className='font-bold'>Fusion Strategy:</span> Concatenation -&gt;
                    Dense(64) -&gt; LSTM Entry
                  </div>
                </div>
              </div>

              {/* Advanced Settings (Dropout/Regularization) */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Settings size={16} className='text-cyan-400' /> Hyperparameters & Regularization
                </h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='text-xs font-mono text-gray-500 block mb-1'>
                      Dropout Rate (Prevention of Overfitting)
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='range'
                        className='w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500'
                      />
                      <span className='text-xs font-bold text-cyan-400'>0.2</span>
                    </div>
                  </div>
                  <div>
                    <label className='text-xs font-mono text-gray-500 block mb-1'>
                      L2 Regularization (Weight Decay)
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='range'
                        className='w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500'
                      />
                      <span className='text-xs font-bold text-cyan-400'>1e-4</span>
                    </div>
                  </div>
                  <div>
                    <label className='text-xs font-mono text-gray-500 block mb-1'>
                      Attention Heads (Transformer)
                    </label>
                    <select className='w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white'>
                      <option>4 Heads</option>
                      <option>8 Heads</option>
                      <option>12 Heads</option>
                    </select>
                  </div>
                  <div>
                    <label className='text-xs font-mono text-gray-500 block mb-1'>
                      Activation Function
                    </label>
                    <select className='w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white'>
                      <option>ReLU (Rectified Linear)</option>
                      <option>Leaky ReLU</option>
                      <option>Tanh</option>
                      <option>Swish (Google)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: TRAINING DOJO --- */}
        {activeTab === 'TRAINING' && (
          <div className='space-y-6'>
            {/* 1. CONTROL BAR */}
            <div className='flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800'>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-3'>
                  <div className='text-xs text-gray-500 font-mono uppercase'>Status</div>
                  <div
                    className={`text-sm font-bold flex items-center gap-2 ${isTraining ? 'text-green-400' : 'text-yellow-500'}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isTraining ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}
                    ></span>
                    {isTraining ? 'TRAINING IN PROGRESS' : 'IDLE / READY'}
                  </div>
                </div>
                <div className='h-8 w-px bg-gray-800'></div>
                <div>
                  <div className='text-xs text-gray-500 font-mono uppercase'>Epoch</div>
                  <div className='text-lg font-bold text-white font-mono'>
                    {epoch} <span className='text-xs text-gray-600'>/ 1000</span>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setEpoch(0)}
                  className='px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400'
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsTraining(!isTraining)}
                  className={`px-6 py-2 rounded font-bold font-mono text-sm flex items-center gap-2 transition-all ${isTraining ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}
                >
                  {isTraining ? (
                    <>
                      <Pause size={16} /> PAUSE
                    </>
                  ) : (
                    <>
                      <Play size={16} /> START LOOP
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* 2. LOSS CHART */}
              <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg min-h-[300px]'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-bold text-gray-300 flex items-center gap-2'>
                    <Activity size={16} className='text-blue-400' /> Loss Convergence (Huber Loss)
                  </h3>
                  <div className='flex gap-4 text-xs font-mono'>
                    <span className='text-blue-400'>
                      Train:{' '}
                      {lossData.length > 0
                        ? lossData[lossData.length - 1].loss.toFixed(4)
                        : '0.0000'}
                    </span>
                    <span className='text-purple-400'>
                      Val:{' '}
                      {lossData.length > 0
                        ? lossData[lossData.length - 1].val_loss.toFixed(4)
                        : '0.0000'}
                    </span>
                  </div>
                </div>
                <div className='h-[250px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={lossData}>
                      <defs>
                        <linearGradient id='colorLoss' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                          <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                      <XAxis dataKey='epoch' hide />
                      <YAxis stroke='#4b5563' fontSize={10} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '10px',
                        }}
                      />
                      <Area
                        type='monotone'
                        dataKey='loss'
                        stroke='#3b82f6'
                        fillOpacity={1}
                        fill='url(#colorLoss)'
                      />
                      <Line
                        type='monotone'
                        dataKey='val_loss'
                        stroke='#a855f7'
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. GPU METRICS */}
              <div className='space-y-4'>
                <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
                  <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                    <Cpu size={16} className='text-green-400' /> GPU Acceleration (CUDA)
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <div className='flex justify-between text-xs text-gray-400 mb-1'>
                        <span>VRAM Usage (RTX 4090)</span>
                        <span className='text-white'>18.4 GB / 24 GB</span>
                      </div>
                      <div className='w-full h-2 bg-gray-800 rounded-full overflow-hidden'>
                        <div className='h-full bg-green-500 w-[75%] animate-pulse'></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-xs text-gray-400 mb-1'>
                        <span>Core Load</span>
                        <span className='text-white'>92%</span>
                      </div>
                      <div className='w-full h-2 bg-gray-800 rounded-full overflow-hidden'>
                        <div className='h-full bg-blue-500 w-[92%]'></div>
                      </div>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-black/40 rounded border border-gray-800'>
                      <span className='text-xs text-gray-500'>Temp</span>
                      <span
                        className={`text-lg font-bold font-mono ${gpuTemp > 80 ? 'text-red-500' : 'text-green-400'}`}
                      >
                        {gpuTemp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
                  <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                    <Settings size={16} className='text-gray-400' /> Tuning
                  </h3>
                  <div className='space-y-3'>
                    <div>
                      <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                        Learning Rate
                      </label>
                      <select className='w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white'>
                        <option>0.001 (Adam Default)</option>
                        <option>0.0001 (Fine Tuning)</option>
                        <option>0.01 (Aggressive)</option>
                      </select>
                    </div>
                    <div>
                      <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                        Batch Size
                      </label>
                      <select className='w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white'>
                        <option>32</option>
                        <option>64</option>
                        <option>128</option>
                        <option>256 (Requires High VRAM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: EVALUATION --- */}
        {activeTab === 'EVALUATION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. METRICS RADAR */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-2 self-start'>
                <Target size={16} className='text-red-400' /> Model Performance
              </h3>
              <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <RadarChart
                    cx='50%'
                    cy='50%'
                    outerRadius='80%'
                    data={[
                      { subject: 'Accuracy', A: 85, fullMark: 100 },
                      { subject: 'Precision', A: 78, fullMark: 100 },
                      { subject: 'Recall', A: 82, fullMark: 100 },
                      { subject: 'F1-Score', A: 80, fullMark: 100 },
                      { subject: 'Latency', A: 90, fullMark: 100 },
                      { subject: 'Robustness', A: 65, fullMark: 100 },
                    ]}
                  >
                    <PolarGrid stroke='#374151' />
                    <PolarAngleAxis dataKey='subject' tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name='Current Model'
                      dataKey='A'
                      stroke='#ef4444'
                      fill='#ef4444'
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. VERSION CONTROL */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <GitBranch size={16} className='text-orange-400' /> Model Registry (Version Control)
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-left font-mono text-xs'>
                  <thead className='text-gray-500 border-b border-gray-800'>
                    <tr>
                      <th className='pb-2'>Version</th>
                      <th className='pb-2'>Date</th>
                      <th className='pb-2'>Acc</th>
                      <th className='pb-2'>Loss</th>
                      <th className='pb-2 text-right'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-800'>
                    <tr className='bg-green-900/10'>
                      <td className='py-3 text-green-400 font-bold'>v2.4.0 (Live)</td>
                      <td className='py-3 text-gray-500'>Today, 10:00</td>
                      <td className='py-3 text-white'>85.4%</td>
                      <td className='py-3 text-white'>0.021</td>
                      <td className='py-3 text-right'>
                        <span className='text-green-500 text-[10px] border border-green-500 px-1 rounded'>
                          DEPLOYED
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-3 text-gray-300'>v2.3.5</td>
                      <td className='py-3 text-gray-500'>Yesterday</td>
                      <td className='py-3 text-gray-400'>82.1%</td>
                      <td className='py-3 text-gray-400'>0.035</td>
                      <td className='py-3 text-right'>
                        <button className='text-blue-400 hover:underline'>Rollback</button>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-3 text-gray-300'>v2.3.0</td>
                      <td className='py-3 text-gray-500'>2 days ago</td>
                      <td className='py-3 text-gray-400'>79.5%</td>
                      <td className='py-3 text-gray-400'>0.042</td>
                      <td className='py-3 text-right'>
                        <button className='text-blue-400 hover:underline'>Rollback</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className='w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-mono text-xs flex items-center justify-center gap-2'>
                <Save size={14} /> SAVE CURRENT CHECKPOINT
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 4: RL AGENT (OPTIONAL) --- */}
        {activeTab === 'RL_AGENT' && (
          <div className='grid grid-cols-1 gap-6'>
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Dna size={16} className='text-pink-500' /> Reinforcement Learning Agent (PPO/DQN)
              </h3>

              <div className='grid grid-cols-3 gap-6 mb-6'>
                <div className='p-4 bg-black/40 rounded border border-gray-800 text-center'>
                  <div className='text-xs text-gray-500 uppercase mb-2'>Environment State</div>
                  <div className='text-xl font-mono text-blue-400 font-bold'>
                    [1.2, -0.5, 0.02, 45000]
                  </div>
                  <div className='text-[10px] text-gray-600 mt-1'>Price, Momentum, Vol, Depth</div>
                </div>
                <div className='p-4 bg-black/40 rounded border border-gray-800 text-center relative overflow-hidden'>
                  <div className='absolute top-0 left-0 w-1 h-full bg-green-500 animate-pulse'></div>
                  <div className='text-xs text-gray-500 uppercase mb-2'>Agent Action</div>
                  <div className='text-2xl font-mono text-green-400 font-bold'>LONG (2x)</div>
                </div>
                <div className='p-4 bg-black/40 rounded border border-gray-800 text-center'>
                  <div className='text-xs text-gray-500 uppercase mb-2'>Last Reward</div>
                  <div className='text-xl font-mono text-yellow-400 font-bold'>+12.5 Pts</div>
                </div>
              </div>

              <div className='h-[200px] bg-gray-950 rounded border border-gray-800 relative flex items-center justify-center'>
                <span className='text-gray-600 font-mono text-xs'>
                  Simulation Visualization Placeholder
                </span>
                {/* Simple animated dot representing the agent */}
                <div className='absolute w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_15px_#ec4899] top-1/2 left-1/4 animate-bounce'></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralNetPanel;
