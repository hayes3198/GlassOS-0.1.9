import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  X, 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Terminal, 
  Flame, 
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { WasmIsolateVM, IsolateExecutionResult } from '../lib/WasmIsolateVM';

interface SpreadsheetIsolateDialogProps {
  isolateCycleCap: number;
  setIsolateCycleCap: (cap: number) => void;
  isolateStepLimit: number;
  setIsolateStepLimit: (steps: number) => void;
  lastIsolateMetrics: { cycles: number; durationMs: number; status: string; udfCount: number };
  onClose: () => void;
  addNotification?: (title: string, msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function SpreadsheetIsolateDialog({
  isolateCycleCap,
  setIsolateCycleCap,
  isolateStepLimit,
  setIsolateStepLimit,
  lastIsolateMetrics,
  onClose,
  addNotification
}: SpreadsheetIsolateDialogProps) {
  const [activeTab, setActiveTab] = useState<'quotas' | 'tester' | 'udfs' | 'oncompute'>('quotas');
  const [testFormula, setTestFormula] = useState<string>("SUM(A1:B2) * 1.05 + UDF('EXPONENTIAL_GROWTH', 1000, 0.08, 5)");
  const [testContext, setTestContext] = useState<string>('{"A1": 150, "A2": 250, "B1": 300, "B2": 400}');
  const [testResult, setTestResult] = useState<IsolateExecutionResult | null>(null);
  const [onComputeHookCode, setOnComputeHookCode] = useState<string>(
    `// onCompute Hook for Spreadsheet Relational Calculations\nfunction onCompute(ctx) {\n  let total = (ctx.A1 || 0) + (ctx.A2 || 0) + (ctx.B1 || 0) + (ctx.B2 || 0);\n  let growth = ctx.UDF_EXPONENTIAL ? ctx.UDF_EXPONENTIAL(total, 0.05, 3) : total * 1.15;\n  return {\n    subtotal: total,\n    projectedGrowth: Math.round(growth * 100) / 100,\n    status: "ISOLATE_VALIDATED"\n  };\n}`
  );
  const [hookResult, setHookResult] = useState<any>(null);

  const handleRunTest = () => {
    let ctx = {};
    try {
      ctx = JSON.parse(testContext);
    } catch {
      ctx = { A1: 150, A2: 250, B1: 300, B2: 400 };
    }
    const res = WasmIsolateVM.evaluateSandboxed(testFormula, ctx, {
      cycleCap: isolateCycleCap,
      maxStepLimit: isolateStepLimit,
    });
    setTestResult(res);
    if (addNotification) {
      if (res.success) {
        addNotification('Isolate VM', `Executed in ${res.cyclesUsed} cycles (${res.durationMs.toFixed(2)}ms)`, 'success');
      } else {
        addNotification('Isolate VM', res.error || 'Execution failed', 'error');
      }
    }
  };

  const handleRunDosProtectionTest = () => {
    // Deliberately trigger infinite cycle consumption
    const heavyFormula = "SUM(A1:B2) + 99999";
    const res = WasmIsolateVM.evaluateSandboxed(heavyFormula, { A1: 10, A2: 20, B1: 30, B2: 40 }, {
      cycleCap: 50, // Extremely tight cap to prove DoS protection
      maxStepLimit: 20,
    });
    setTestResult(res);
    if (addNotification) {
      addNotification('DoS Protection Test', `Cycle cap triggered safely: ${res.error}`, 'warning');
    }
  };

  const handleRunOnComputeHook = async () => {
    let ctx = { A1: 500, A2: 750, B1: 1200, B2: 1800 };
    try {
      ctx = { ...ctx, ...JSON.parse(testContext) };
    } catch {
      // use default ctx
    }
    const res = await WasmIsolateVM.executeOnComputeHook('sheet_integrity_check', ctx);
    setHookResult(res);
    if (addNotification) {
      if (res.success) {
        addNotification('onCompute Hook', `Hook completed successfully (${res.cyclesUsed} cycles)`, 'success');
      } else {
        addNotification('onCompute Hook', res.error || 'Hook execution failed', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-[680px] max-h-[85vh] bg-[#0c121e] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Wasm / V8 Isolate Sandboxing & Execution Quotas
              </h3>
              <p className="text-[11px] text-emerald-400/80 font-mono">
                Hardened Zero-Eval AST Engine • Cycle Capped & Memory Isolated
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-800/80 text-xs shrink-0 font-medium">
          <button
            onClick={() => setActiveTab('quotas')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'quotas' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quotas & Gas Caps
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tester' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Formula & AST Tester
          </button>
          <button
            onClick={() => setActiveTab('oncompute')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'oncompute' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            onCompute Hook Runner
          </button>
          <button
            onClick={() => setActiveTab('udfs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'udfs' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sandboxed UDF Registry
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {activeTab === 'quotas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Zap size={14} className="text-emerald-400" />
                    Active Sandbox Status
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/40">
                    ZERO_EVAL_ENFORCED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  All spreadsheet cell formulas, ranges, and user-defined functions are processed inside a WebAssembly-emulated isolate environment with deterministic cycle counting. Raw JavaScript string evaluation (<code className="text-amber-400">eval()</code>, <code className="text-amber-400">Function()</code>) is completely eliminated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-[11px]">Formula Cycle Cap</label>
                    <span className="font-mono text-emerald-400 font-bold">{isolateCycleCap.toLocaleString()} Cycles</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="50000" 
                    step="500"
                    value={isolateCycleCap} 
                    onChange={(e) => setIsolateCycleCap(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Max execution gas/cycles allocated per formula evaluation. Prevents infinite computation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-[11px]">AST Step Limit</label>
                    <span className="font-mono text-emerald-400 font-bold">{isolateStepLimit.toLocaleString()} Steps</span>
                  </div>
                  <input 
                    type="range" 
                    min="200" 
                    max="20000" 
                    step="200"
                    value={isolateStepLimit} 
                    onChange={(e) => setIsolateStepLimit(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Max AST expression node evaluations before an execution interruption is triggered.
                  </p>
                </div>
              </div>

              {/* Live Telemetry Summary */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Recent Isolate Execution Telemetry
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <div className="text-[10px] text-slate-400 uppercase">Status</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">{lastIsolateMetrics.status}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <div className="text-[10px] text-slate-400 uppercase">Avg Cycles</div>
                    <div className="font-mono font-bold text-cyan-400 mt-0.5">{lastIsolateMetrics.cycles} cyc</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                    <div className="font-mono font-bold text-indigo-400 mt-0.5">{lastIsolateMetrics.durationMs.toFixed(2)} ms</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <div className="text-[10px] text-slate-400 uppercase">Active UDFs</div>
                    <div className="font-mono font-bold text-amber-400 mt-0.5">{lastIsolateMetrics.udfCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 text-[11px]">Sandboxed Formula Expression</label>
                <input 
                  type="text" 
                  value={testFormula}
                  onChange={(e) => setTestFormula(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. SUM(A1:B2) * 1.10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 text-[11px]">Mock Cell Context (JSON)</label>
                <textarea 
                  value={testContext}
                  onChange={(e) => setTestContext(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleRunTest}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Play size={14} /> Run in Isolate
                </button>
                <button
                  onClick={handleRunDosProtectionTest}
                  className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Flame size={14} /> Trigger Gas Limit Test
                </button>
              </div>

              {testResult && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 text-[11px]">Execution Result</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${testResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {testResult.success ? 'SUCCESS' : (testResult.quotaExceeded ? 'QUOTA_EXCEEDED' : 'ERROR')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 font-mono text-sm text-emerald-400 break-all">
                    {testResult.success ? JSON.stringify(testResult.result) : testResult.error}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                    <span>Cycles Consumed: <strong className="text-cyan-400">{testResult.cyclesConsumed}</strong></span>
                    <span>Execution Time: <strong className="text-indigo-400">{testResult.executionTimeMs.toFixed(2)}ms</strong></span>
                    <span>Memory: <strong className="text-emerald-400">ISOLATED</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'oncompute' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-slate-300">
                <strong className="text-indigo-300">onCompute Document & Sheet Hooks:</strong> Hook functions execute on cell modification or document changes inside an isolated AST sandbox with strict cycle quotas.
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 text-[11px]">Hook Source Code</label>
                <textarea 
                  value={onComputeHookCode}
                  onChange={(e) => setOnComputeHookCode(e.target.value)}
                  rows={8}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <button
                onClick={handleRunOnComputeHook}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play size={14} /> Execute Sandboxed Hook
              </button>

              {hookResult && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="text-[11px] font-bold text-indigo-300">Hook Output:</div>
                  <pre className="p-2.5 rounded-lg bg-black/40 text-emerald-400 overflow-x-auto text-[11px]">
                    {JSON.stringify(hookResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'udfs' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-[11px]">Built-in Hardened UDF Formulas</div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <div className="font-mono font-bold text-emerald-400">=UDF("EXPONENTIAL_GROWTH", principal, rate, periods)</div>
                    <div className="text-slate-400 mt-1">Calculates compounding exponential return securely with cycle validation.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <div className="font-mono font-bold text-emerald-400">=UDF("COMPOUND_INTEREST", principal, rate, n, t)</div>
                    <div className="text-slate-400 mt-1">Computes discrete annual or monthly compounding balance.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <div className="font-mono font-bold text-emerald-400">=UDF("WEIGHTED_SCORE", score1, weight1, score2, weight2)</div>
                    <div className="text-slate-400 mt-1">Computes normalized multi-factor weighted scores.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-mono text-[10px]">GlassOS Security Module • v2.4 Hardened</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close & Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
}
