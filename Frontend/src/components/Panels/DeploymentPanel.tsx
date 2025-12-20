import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Server,
  ShieldCheck,
  FileText,
  Bell,
  Send,
  Clock,
  Cpu,
  Database,
  Lock,
  Globe,
  CheckSquare,
  AlertTriangle,
  Download,
  Terminal,
  Activity,
  HardDrive,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Tab = 'OPS_CENTER' | 'ALERTS_REPORTS' | 'SECURITY_DOCS' | 'GO_LIVE';

const DeploymentPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OPS_CENTER');
  const [sysLoad, setSysLoad] = useState<any[]>([]);
  const [tgConnected, setTgConnected] = useState(false);
  const [checklist, setChecklist] = useState({
    api: true,
    funds: true,
    strategy: true,
    security: false,
    logs: true,
  });

  // Mock System Load
  useEffect(() => {
    const interval = setInterval(() => {
      setSysLoad((prev) => {
        const now = new Date().toLocaleTimeString();
        const cpu = 30 + Math.random() * 20;
        const ram = 45 + Math.random() * 5;
        return [...prev, { time: now, cpu, ram }].slice(-20);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-600/10 rounded-lg'>
              <Rocket className='text-green-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>DEPLOYMENT & OPS</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 10: Production Launch & Monitoring
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-[600px] custom-scrollbar'>
            {[
              { id: 'OPS_CENTER', icon: Server, label: 'Ops Center' },
              { id: 'ALERTS_REPORTS', icon: Bell, label: 'Alerts & Reports' },
              { id: 'SECURITY_DOCS', icon: ShieldCheck, label: 'Security & Docs' },
              { id: 'GO_LIVE', icon: Globe, label: 'Mainnet Launch' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap
                            ${
                              activeTab === item.id
                                ? 'bg-green-900/30 text-green-300 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
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
        {/* --- TAB 1: OPS CENTER --- */}
        {activeTab === 'OPS_CENTER' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. SYSTEM HEALTH MONITOR */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Activity size={16} className='text-blue-400' /> System Health Monitor (VPS/Cloud)
              </h3>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={sysLoad}>
                    <defs>
                      <linearGradient id='colorCpu' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id='colorRam' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#a855f7' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#a855f7' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='time' hide />
                    <YAxis domain={[0, 100]} stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        fontSize: '10px',
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='cpu'
                      stroke='#3b82f6'
                      fill='url(#colorCpu)'
                      name='CPU Usage %'
                    />
                    <Area
                      type='monotone'
                      dataKey='ram'
                      stroke='#a855f7'
                      fill='url(#colorRam)'
                      name='RAM Usage %'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className='grid grid-cols-4 gap-4 mt-4'>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center gap-3'>
                  <Cpu size={20} className='text-blue-500' />
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>CPU Load</div>
                    <div className='text-sm font-bold text-white'>32%</div>
                  </div>
                </div>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center gap-3'>
                  <Database size={20} className='text-purple-500' />
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>RAM Usage</div>
                    <div className='text-sm font-bold text-white'>4.2 GB</div>
                  </div>
                </div>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center gap-3'>
                  <HardDrive size={20} className='text-yellow-500' />
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>Disk Space</div>
                    <div className='text-sm font-bold text-white'>12% Used</div>
                  </div>
                </div>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center gap-3'>
                  <Server size={20} className='text-green-500' />
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>Uptime</div>
                    <div className='text-sm font-bold text-white'>12d 4h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CRON JOBS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Clock size={16} className='text-yellow-400' /> Automated Tasks (Cron)
              </h3>
              <div className='space-y-3'>
                {[
                  {
                    name: 'Model Retraining',
                    sched: '0 0 * * Sun',
                    next: 'Sunday 00:00',
                    status: 'Active',
                  },
                  {
                    name: 'Log Rotation',
                    sched: '0 0 * * *',
                    next: 'Tomorrow 00:00',
                    status: 'Active',
                  },
                  {
                    name: 'Db Backup (S3)',
                    sched: '0 */6 * * *',
                    next: '18:00 Today',
                    status: 'Active',
                  },
                  {
                    name: 'System Reboot',
                    sched: '0 4 1 * *',
                    next: '1st of Month',
                    status: 'Paused',
                  },
                ].map((job, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'
                  >
                    <div>
                      <div className='text-xs font-bold text-gray-300'>{job.name}</div>
                      <div className='text-[10px] text-gray-500 font-mono'>{job.sched}</div>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`text-[10px] px-2 py-0.5 rounded border ${job.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
                      >
                        {job.status}
                      </div>
                      <div className='text-[9px] text-gray-600 mt-1'>Next: {job.next}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. LOGGING CONFIG */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FileText size={16} className='text-gray-400' /> Logging Configuration
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Log Level
                  </label>
                  <select className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-xs'>
                    <option>INFO (Standard)</option>
                    <option>DEBUG (Verbose)</option>
                    <option>WARNING (Only Errors)</option>
                  </select>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Storage Driver
                  </label>
                  <select className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-xs'>
                    <option>Local File System</option>
                    <option>AWS CloudWatch</option>
                    <option>Datadog Agent</option>
                  </select>
                </div>
                <div className='flex gap-4 pt-2'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' checked className='accent-green-500' />
                    <span className='text-xs text-gray-400'>Compress Archives (gzip)</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' className='accent-green-500' />
                    <span className='text-xs text-gray-400'>Encrypt Logs</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: ALERTS & REPORTS --- */}
        {activeTab === 'ALERTS_REPORTS' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. TELEGRAM BOT INTEGRATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Send size={16} className='text-blue-400' /> Telegram Bot Alert System
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Bot API Token
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      value='123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
                      className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white text-xs font-mono pr-8'
                      readOnly
                    />
                    <Lock size={12} className='absolute right-3 top-2.5 text-green-500' />
                  </div>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Chat ID (Channel/User)
                  </label>
                  <input
                    type='text'
                    value='@NeuralBotAlerts'
                    className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white text-xs font-mono'
                    readOnly
                  />
                </div>

                <div className='bg-black/30 p-3 rounded border border-gray-800'>
                  <div className='text-[10px] text-gray-500 mb-2 uppercase'>
                    Notification Triggers
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      'Trade Executed',
                      'Stop Loss Hit',
                      'System Error',
                      'Daily Summary',
                      'Whale Alert',
                      'Login Detected',
                    ].map((t) => (
                      <label key={t} className='flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' checked className='accent-blue-500 w-3 h-3' />
                        <span className='text-xs text-gray-400'>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => setTgConnected(true)}
                    className={`flex-1 py-2 rounded font-bold text-xs transition-colors ${tgConnected ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {tgConnected ? 'CONNECTED' : 'CONNECT BOT'}
                  </button>
                  <button className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 text-xs'>
                    TEST MSG
                  </button>
                </div>
              </div>
            </div>

            {/* 2. REPORT SCHEDULER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FileText size={16} className='text-purple-400' /> Periodic Reporting
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-900/20 rounded'>
                      <Download size={14} className='text-purple-400' />
                    </div>
                    <div>
                      <div className='text-xs font-bold text-gray-200'>Daily PnL PDF</div>
                      <div className='text-[10px] text-gray-500'>Auto-send at 00:00 UTC</div>
                    </div>
                  </div>
                  <input
                    type='checkbox'
                    checked
                    className='toggle-checkbox accent-purple-500 w-4 h-4'
                  />
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-900/20 rounded'>
                      <Download size={14} className='text-purple-400' />
                    </div>
                    <div>
                      <div className='text-xs font-bold text-gray-200'>
                        Weekly Performance Review
                      </div>
                      <div className='text-[10px] text-gray-500'>Every Sunday</div>
                    </div>
                  </div>
                  <input
                    type='checkbox'
                    checked
                    className='toggle-checkbox accent-purple-500 w-4 h-4'
                  />
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-900/20 rounded'>
                      <Download size={14} className='text-purple-400' />
                    </div>
                    <div>
                      <div className='text-xs font-bold text-gray-200'>Tax CSV Export</div>
                      <div className='text-[10px] text-gray-500'>Monthly</div>
                    </div>
                  </div>
                  <input type='checkbox' className='toggle-checkbox accent-purple-500 w-4 h-4' />
                </div>
              </div>
            </div>

            {/* 3. LIVE PNL PREVIEW */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Activity size={16} className='text-green-400' /> Live PnL Dashboard View
              </h3>
              <div className='h-[200px] w-full bg-black/40 rounded border border-gray-800 flex items-center justify-center relative overflow-hidden'>
                {/* Fake Chart Background */}
                <div className='absolute inset-0 opacity-20'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={Array.from({ length: 20 }, (_, i) => ({ v: Math.random() }))}>
                      <Area type='monotone' dataKey='v' stroke='#22c55e' fill='#22c55e' />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className='z-10 text-center'>
                  <div className='text-xs text-gray-500 uppercase tracking-widest mb-1'>
                    Unrealized PnL
                  </div>
                  <div className='text-4xl font-bold font-mono text-green-400 animate-pulse'>
                    +$1,245.50
                  </div>
                  <div className='text-sm text-green-600 font-bold mt-1'>(+2.4%)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: SECURITY & DOCS --- */}
        {activeTab === 'SECURITY_DOCS' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. SECURITY AUDIT */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <ShieldCheck size={16} className='text-green-400' /> Security Audit Scorecard
              </h3>
              <div className='space-y-4'>
                {[
                  { name: 'API Key Encryption', status: 'PASS', msg: 'AES-256 Enabled' },
                  { name: 'IP Whitelisting', status: 'WARN', msg: 'Not configured on Exchange' },
                  { name: '2FA Enforcement', status: 'PASS', msg: 'Google Auth Active' },
                  { name: 'Withdrawal Whitelist', status: 'FAIL', msg: 'Open to all addresses' },
                  { name: 'SSL/TLS Certificate', status: 'PASS', msg: 'Valid (LetsEncrypt)' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'
                  >
                    <div>
                      <div className='text-xs font-bold text-white'>{item.name}</div>
                      <div className='text-[10px] text-gray-500'>{item.msg}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        item.status === 'PASS'
                          ? 'bg-green-900/20 text-green-400 border-green-500/30'
                          : item.status === 'WARN'
                            ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-red-900/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className='w-full mt-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs rounded border border-gray-700 flex items-center justify-center gap-2'>
                <ShieldCheck size={14} /> RUN NEW AUDIT
              </button>
            </div>

            {/* 2. DOCUMENTATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <FileText size={16} className='text-indigo-400' /> Documentation Generator
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-gray-950 rounded border border-gray-800 flex flex-col items-center text-center hover:border-indigo-500 transition-colors cursor-pointer group'>
                  <Terminal size={24} className='text-gray-500 group-hover:text-indigo-400 mb-2' />
                  <div className='text-sm font-bold text-gray-200'>API Reference</div>
                  <div className='text-[10px] text-gray-500 mt-1'>Swagger / OpenAPI 3.0</div>
                </div>
                <div className='p-4 bg-gray-950 rounded border border-gray-800 flex flex-col items-center text-center hover:border-indigo-500 transition-colors cursor-pointer group'>
                  <FileText size={24} className='text-gray-500 group-hover:text-indigo-400 mb-2' />
                  <div className='text-sm font-bold text-gray-200'>User Manual</div>
                  <div className='text-[10px] text-gray-500 mt-1'>PDF Export (v2.1)</div>
                </div>
                <div className='p-4 bg-gray-950 rounded border border-gray-800 flex flex-col items-center text-center hover:border-indigo-500 transition-colors cursor-pointer group'>
                  <Activity size={24} className='text-gray-500 group-hover:text-indigo-400 mb-2' />
                  <div className='text-sm font-bold text-gray-200'>Logic Flowchart</div>
                  <div className='text-[10px] text-gray-500 mt-1'>Mermaid.js Diagram</div>
                </div>
                <div className='p-4 bg-gray-950 rounded border border-gray-800 flex flex-col items-center text-center hover:border-indigo-500 transition-colors cursor-pointer group'>
                  <Database size={24} className='text-gray-500 group-hover:text-indigo-400 mb-2' />
                  <div className='text-sm font-bold text-gray-200'>Schema Docs</div>
                  <div className='text-[10px] text-gray-500 mt-1'>PostgreSQL ERD</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: GO LIVE --- */}
        {activeTab === 'GO_LIVE' && (
          <div className='flex flex-col items-center justify-center h-full max-w-2xl mx-auto'>
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-8 shadow-2xl w-full'>
              <h2 className='text-2xl font-bold text-white text-center mb-2 flex items-center justify-center gap-3'>
                <Globe className='text-green-500 animate-pulse' /> MAINNET LAUNCHPAD
              </h2>
              <p className='text-gray-500 text-center text-sm mb-8'>
                Initiate live trading on real capital. This action is irreversible.
              </p>

              <div className='space-y-4 mb-8'>
                <div className='text-xs text-gray-400 uppercase font-bold mb-2'>
                  Pre-Flight Checklist
                </div>
                {[
                  { k: 'api', l: 'API Keys Validated (Trade Permissions)' },
                  { k: 'funds', l: 'Wallet Balance > Minimum ($100)' },
                  { k: 'strategy', l: 'Strategy Logic Verified (Backtest Passed)' },
                  { k: 'security', l: 'Security Audit Passed (No Critical Issues)' },
                  { k: 'logs', l: 'Logging System Operational' },
                ].map((item) => (
                  <div
                    key={item.k}
                    onClick={() =>
                      setChecklist((prev) => ({
                        ...prev,
                        [item.k]: !prev[item.k as keyof typeof checklist],
                      }))
                    }
                    className='flex items-center gap-3 p-3 rounded border border-gray-800 bg-gray-950 cursor-pointer hover:bg-gray-800 transition-colors'
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${checklist[item.k as keyof typeof checklist] ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}
                    >
                      {checklist[item.k as keyof typeof checklist] && (
                        <CheckSquare size={12} className='text-black' />
                      )}
                    </div>
                    <span
                      className={`text-sm ${checklist[item.k as keyof typeof checklist] ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      {item.l}
                    </span>
                  </div>
                ))}
              </div>

              <div className='p-4 bg-red-900/10 border border-red-500/20 rounded mb-8 text-center'>
                <AlertTriangle className='text-red-500 mx-auto mb-2' />
                <h4 className='text-red-400 font-bold text-sm'>Warning: Real Money At Risk</h4>
                <p className='text-[10px] text-red-300/70 mt-1'>
                  Ensure Stop-Losses are hard-coded. The developer assumes no liability.
                </p>
              </div>

              <button
                disabled={!Object.values(checklist).every(Boolean)}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]
                            ${
                              Object.values(checklist).every(Boolean)
                                ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                            }
                        `}
              >
                <Rocket size={24} /> INITIATE LAUNCH SEQUENCE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentPanel;
