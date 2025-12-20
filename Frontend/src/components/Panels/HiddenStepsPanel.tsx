import React, { useState, useEffect } from 'react';
import {
  Shield,
  DollarSign,
  Globe,
  Lock,
  AlertTriangle,
  Server,
  Key,
  Eye,
  FileCheck,
  CreditCard,
  BellRing,
  PieChart as PieChartIcon,
  RefreshCw,
  Wifi,
  HardDrive,
  Activity,
  CheckCircle,
  XCircle,
  Smartphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

type Tab = 'BUDGET_MGMT' | 'LEGAL_NETWORK' | 'OPSEC_SECURITY';

const HiddenStepsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('BUDGET_MGMT');

  // Mock Data
  const [costData, setCostData] = useState<any[]>([]);
  const [yubiKeyStatus, setYubiKeyStatus] = useState<'INSERTED' | 'REMOVED'>('REMOVED');
  const [proxyHealth, setProxyHealth] = useState(98);

  useEffect(() => {
    // Simulate Daily Cloud Costs
    const data = [];
    let accumulated = 0;
    for (let i = 1; i <= 30; i++) {
      accumulated += Math.random() * 2 + 1; // $1-3 per day
      data.push({
        day: `Day ${i}`,
        daily: Math.random() * 2 + 1,
        accumulated: accumulated,
      });
    }
    setCostData(data);

    // Simulate YubiKey Interaction
    const interval = setInterval(() => {
      setYubiKeyStatus((prev) => (prev === 'INSERTED' ? 'REMOVED' : 'INSERTED'));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const COST_BREAKDOWN = [
    { name: 'EC2 Instances', value: 45, color: '#f59e0b' },
    { name: 'RDS Database', value: 25, color: '#3b82f6' },
    { name: 'Data Transfer', value: 15, color: '#10b981' },
    { name: 'Lambda/Serverless', value: 10, color: '#8b5cf6' },
    { name: 'S3 Storage', value: 5, color: '#6b7280' },
  ];

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gray-800 rounded-lg'>
              <Eye className='text-gray-400' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>THE HIDDEN STEPS</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 13: Budget, Compliance & OpSec
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-[600px] custom-scrollbar'>
            {[
              { id: 'BUDGET_MGMT', icon: DollarSign, label: 'Budget & Cloud' },
              { id: 'LEGAL_NETWORK', icon: Globe, label: 'Legal & Proxies' },
              { id: 'OPSEC_SECURITY', icon: Shield, label: 'OpSec & Hardware' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap
                            ${
                              activeTab === item.id
                                ? 'bg-gray-800 text-white border border-gray-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar pr-2'>
        {/* --- TAB 1: BUDGET MANAGEMENT --- */}
        {activeTab === 'BUDGET_MGMT' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. COST FORECAST */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <CreditCard size={16} className='text-green-400' /> Cloud Cost Monitoring (AWS/GCP)
              </h3>
              <div className='grid grid-cols-3 gap-4 mb-6'>
                <div className='p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 uppercase'>Current Month</div>
                  <div className='text-2xl font-bold text-white font-mono'>$45.20</div>
                  <div className='text-[10px] text-green-400'>Within Budget</div>
                </div>
                <div className='p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 uppercase'>Forecasted Total</div>
                  <div className='text-2xl font-bold text-yellow-400 font-mono'>$82.50</div>
                  <div className='text-[10px] text-gray-500'>End of Month</div>
                </div>
                <div className='p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 uppercase'>Alert Threshold</div>
                  <div className='text-2xl font-bold text-red-400 font-mono'>$100.00</div>
                  <div className='text-[10px] text-gray-500'>Hard Stop Trigger</div>
                </div>
              </div>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={costData}>
                    <defs>
                      <linearGradient id='colorCost' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='day' hide />
                    <YAxis stroke='#4b5563' fontSize={10} unit='$' />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        fontSize: '10px',
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='accumulated'
                      stroke='#10b981'
                      fill='url(#colorCost)'
                      name='Total Cost'
                    />
                    <Bar dataKey='daily' fill='#3b82f6' name='Daily Usage' />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. COST BREAKDOWN */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <PieChartIcon size={16} className='text-blue-400' /> Service Cost Distribution
              </h3>
              <div className='flex items-center gap-6'>
                <div className='h-[180px] w-1/2'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={COST_BREAKDOWN}
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey='value'
                      >
                        {COST_BREAKDOWN.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke='none' />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '10px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='w-1/2 space-y-2'>
                  {COST_BREAKDOWN.map((item) => (
                    <div key={item.name} className='flex justify-between items-center text-xs'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-2 h-2 rounded-full'
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className='text-gray-300'>{item.name}</span>
                      </div>
                      <span className='text-gray-500 font-bold'>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. ALERTS & OPTIMIZATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <BellRing size={16} className='text-orange-400' /> Alerts & Optimization
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Unused EIP Alert</div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded border border-green-500/30'>
                    Active
                  </span>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Spot Instance Bidding</div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded border border-green-500/30'>
                    Auto (Max $0.05/hr)
                  </span>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Log Retention Policy</div>
                  <span className='text-[10px] text-gray-500'>7 Days (Glacier Archival)</span>
                </div>
                <button className='w-full mt-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded border border-gray-700 flex items-center justify-center gap-2'>
                  <RefreshCw size={12} /> Scan for Idle Resources
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: LEGAL & NETWORK --- */}
        {activeTab === 'LEGAL_NETWORK' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. PROXY ROTATION MAP */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Globe size={16} className='text-blue-500' /> Residential Proxy Network (IP
                Rotation)
              </h3>
              <div className='grid grid-cols-4 gap-4 mb-4'>
                {[
                  { region: 'US-East (N. Virginia)', status: 'Active', latency: '45ms' },
                  { region: 'EU-West (Ireland)', status: 'Active', latency: '110ms' },
                  { region: 'AP-Northeast (Tokyo)', status: 'Standby', latency: '210ms' },
                  { region: 'SA-East (Brazil)', status: 'Disabled', latency: '-' },
                ].map((node, i) => (
                  <div
                    key={i}
                    className='bg-gray-950 p-3 rounded border border-gray-800 flex flex-col gap-1'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='text-xs font-bold text-gray-300'>{node.region}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-green-500 animate-pulse' : node.status === 'Standby' ? 'bg-yellow-500' : 'bg-gray-700'}`}
                      ></div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[10px] text-gray-500'>{node.status}</span>
                      <span className='text-[10px] font-mono text-blue-400'>{node.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className='bg-black/40 p-4 rounded border border-gray-800 relative overflow-hidden'>
                <div
                  className='absolute top-0 left-0 h-1 bg-green-500 transition-all duration-500'
                  style={{ width: `${proxyHealth}%` }}
                ></div>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-gray-400'>Proxy Pool Health</span>
                  <span className='text-green-400 font-bold'>
                    {proxyHealth}% (490/500 IPs Clean)
                  </span>
                </div>
                <div className='mt-2 text-[10px] text-gray-500 font-mono'>
                  Current Exit Node: 192.44.X.X (Rotating in 45s)
                </div>
              </div>
            </div>

            {/* 2. COMPLIANCE CHECKLIST */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FileCheck size={16} className='text-yellow-400' /> Legal & API Compliance
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-2 bg-gray-950 rounded border border-gray-800'>
                  <CheckCircle size={16} className='text-green-500' />
                  <div>
                    <div className='text-xs font-bold text-white'>Rate Limit Adherence</div>
                    <div className='text-[10px] text-gray-500'>
                      Token Bucket implementation active
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-2 bg-gray-950 rounded border border-gray-800'>
                  <CheckCircle size={16} className='text-green-500' />
                  <div>
                    <div className='text-xs font-bold text-white'>User-Agent Spoofing</div>
                    <div className='text-[10px] text-gray-500'>Rotating Header Signatures</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-2 bg-gray-950 rounded border border-gray-800'>
                  <AlertTriangle size={16} className='text-yellow-500' />
                  <div>
                    <div className='text-xs font-bold text-white'>Geo-Blocking Check</div>
                    <div className='text-[10px] text-gray-500'>
                      Confirming jurisdiction match...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. API USAGE STATS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Activity size={16} className='text-purple-400' /> Official API Usage (Anti-Ban)
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 uppercase'>Requests Today</div>
                  <div className='text-xl font-bold text-white font-mono'>14,203</div>
                </div>
                <div className='text-center p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 uppercase'>Weight Consumed</div>
                  <div className='text-xl font-bold text-green-400 font-mono'>4.2%</div>
                </div>
              </div>
              <div className='mt-4 text-[10px] text-gray-500 text-center bg-gray-800/50 p-2 rounded'>
                Note: Official API usage is prioritized over scraping to minimize account ban risk.
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: OPSEC & HARDWARE --- */}
        {activeTab === 'OPSEC_SECURITY' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. YUBIKEY SIMULATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4 absolute top-6 left-6'>
                <Key size={16} className='text-green-500' /> Hardware Authentication (YubiKey)
              </h3>

              <div
                className={`transition-all duration-500 transform ${yubiKeyStatus === 'INSERTED' ? 'scale-110' : 'scale-100 opacity-50'}`}
              >
                <div
                  className={`w-64 h-32 bg-gray-800 rounded-lg border-2 ${yubiKeyStatus === 'INSERTED' ? 'border-green-500 shadow-[0_0_20px_#22c55e]' : 'border-gray-600'} flex items-center justify-center relative`}
                >
                  <div className='w-12 h-12 rounded-full border-4 border-gray-600 bg-black flex items-center justify-center'>
                    <div
                      className={`w-8 h-8 rounded-full ${yubiKeyStatus === 'INSERTED' ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}
                    ></div>
                  </div>
                  <span className='absolute bottom-2 text-[10px] text-gray-500 font-mono tracking-widest uppercase'>
                    YubiKey 5 NFC
                  </span>
                </div>
              </div>

              <div className='mt-8 text-center'>
                <div className='text-sm font-bold text-white mb-1'>
                  Status:{' '}
                  <span
                    className={yubiKeyStatus === 'INSERTED' ? 'text-green-400' : 'text-red-400'}
                  >
                    {yubiKeyStatus}
                  </span>
                </div>
                <p className='text-xs text-gray-500'>
                  {yubiKeyStatus === 'INSERTED'
                    ? 'Hardware token detected. Admin actions authorized.'
                    : 'Insert hardware key to perform sensitive actions.'}
                </p>
              </div>
            </div>

            {/* 2. ENVIRONMENT INTEGRITY */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <HardDrive size={16} className='text-purple-400' /> Environment Integrity Scan
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Malware Sandbox Check</div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded font-bold border border-green-500/30'>
                    CLEAN
                  </span>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Rootkit Detection</div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded font-bold border border-green-500/30'>
                    CLEAN
                  </span>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Process Whitelist</div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded font-bold border border-green-500/30'>
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PERMISSION AUDIT */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Lock size={16} className='text-red-500' /> API Permission Audit
              </h3>
              <div className='grid grid-cols-3 gap-2 text-center'>
                <div className='p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-[10px] text-gray-500 uppercase'>Read Info</div>
                  <CheckCircle size={16} className='text-green-500 mx-auto mt-1' />
                </div>
                <div className='p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-[10px] text-gray-500 uppercase'>Spot Trade</div>
                  <CheckCircle size={16} className='text-green-500 mx-auto mt-1' />
                </div>
                <div className='p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-[10px] text-gray-500 uppercase'>Withdraw</div>
                  <XCircle size={16} className='text-red-500 mx-auto mt-1' />
                </div>
              </div>
              <div className='mt-4 p-2 bg-yellow-900/10 border border-yellow-500/30 rounded text-[10px] text-yellow-400 text-center'>
                Security Best Practice: Withdrawal permissions are DISABLED.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiddenStepsPanel;
