'use client';
import { useState, useRef } from 'react';
import { customerSpending, formatCurrency } from '@/lib/store';
import { BarChart3, Crown, Zap, RefreshCw } from 'lucide-react';
import type { Customer } from '@/lib/store';

type Step = 'idle' | 'loading' | 'building_heap' | 'extracting' | 'done';

// Simple Min-Heap
class MinHeap {
  private data: Customer[] = [];
  push(item: Customer) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }
  pop(): Customer | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) { this.data[0] = last; this.sinkDown(0); }
    return top;
  }
  peek(): Customer | undefined { return this.data[0]; }
  size() { return this.data.length; }
  toArray() { return [...this.data]; }
  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].total_spending <= this.data[i].total_spending) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }
  private sinkDown(i: number) {
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < this.data.length && this.data[l].total_spending < this.data[smallest].total_spending) smallest = l;
      if (r < this.data.length && this.data[r].total_spending < this.data[smallest].total_spending) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TopCustomersPage() {
  const [k, setK] = useState(3);
  const [step, setStep] = useState<Step>('idle');
  const [topK, setTopK] = useState<Customer[]>([]);
  const [heapState, setHeapState] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [cacheAvailable, setCacheAvailable] = useState(false);
  const cacheRef = useRef<Customer[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

  const handleGetTopK = async () => {
    setLogs([]);
    setTopK([]);
    setHeapState([]);
    addLog(`1. getTopKCustomers(k=${k})`);
    setStep('loading');
    await new Promise(r => setTimeout(r, 500));

    // opt [cache available & fresh]
    if (cacheAvailable && cacheRef.current.length > 0) {
      addLog('opt [cache available & fresh] → 3a. get from cache');
      await new Promise(r => setTimeout(r, 400));
      addLog('4a. return top K list from cache ✓');
      setTopK(cacheRef.current.slice(0, k));
      setStep('done');
      return;
    }

    // else recompute
    addLog('[else] recompute — 3b. load all spending data');
    await new Promise(r => setTimeout(r, 500));

    const allCustomers = Array.from(customerSpending.values());
    addLog(`4b. data loaded: ${allCustomers.length} customers`);
    setStep('building_heap');
    await new Promise(r => setTimeout(r, 400));

    addLog(`5b. build Min-Heap size k=${k} — O(n log k)`);
    const heap = new MinHeap();
    for (const customer of allCustomers) {
      heap.push(customer);
      if (heap.size() > k) {
        heap.pop(); // remove minimum
      }
      setHeapState(heap.toArray());
      await new Promise(r => setTimeout(r, 120));
    }

    addLog(`6b. top ${k} customers in heap`);
    setStep('extracting');
    await new Promise(r => setTimeout(r, 400));

    // Extract in order
    const results: Customer[] = [];
    while (heap.size() > 0) {
      results.unshift(heap.pop()!);
    }

    addLog(`7b. update cache`);
    cacheRef.current = results;
    await new Promise(r => setTimeout(r, 300));

    addLog(`8. return top ${k} list ✓`);
    setTopK(results);
    setStep('done');
  };

  const reset = () => { setStep('idle'); setTopK([]); setHeapState([]); setLogs([]); };
  const isRunning = step === 'loading' || step === 'building_heap' || step === 'extracting';
  const maxSpending = Math.max(...Array.from(customerSpending.values()).map(c => c.total_spending));

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-purple)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-purple)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Function 5</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Get Top K Customers by Spending</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Min-Heap size k → O(n log k) · Cache on-demand · Customer Spending Service</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Parameters</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>K Value (top customers)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setK(n)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, background: k === n ? 'var(--accent-purple-dim)' : 'var(--bg-secondary)', border: `1px solid ${k === n ? 'rgba(155,114,255,0.4)' : 'var(--border)'}`, color: k === n ? 'var(--accent-purple)' : 'var(--text-secondary)', cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Cache</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCacheAvailable(true)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, background: cacheAvailable ? 'var(--accent-green-dim)' : 'var(--bg-secondary)', border: `1px solid ${cacheAvailable ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`, color: cacheAvailable ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer' }}>Available</button>
                <button onClick={() => setCacheAvailable(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, background: !cacheAvailable ? 'var(--accent-orange-dim)' : 'var(--bg-secondary)', border: `1px solid ${!cacheAvailable ? 'rgba(255,140,66,0.3)' : 'var(--border)'}`, color: !cacheAvailable ? 'var(--accent-orange)' : 'var(--text-secondary)', cursor: 'pointer' }}>Miss</button>
              </div>
            </div>

            <button className="btn" style={{ width: '100%', background: 'var(--accent-purple)', color: '#fff' }} onClick={handleGetTopK} disabled={isRunning}>
              {isRunning ? <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> Computing...</> : <><Zap size={14} /> Get Top {k} Customers</>}
            </button>

            {step === 'done' && <button className="btn btn-ghost" onClick={reset} style={{ width: '100%', marginTop: 8 }}><RefreshCw size={13} /> Reset</button>}
          </div>

          {/* Complexity */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Complexity</div>
            {[
              { label: 'Build Min-Heap', value: 'O(n log k)' },
              { label: 'Extract k items', value: 'O(k log k)' },
              { label: 'Cache hit', value: 'O(1)' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-purple)', fontWeight: 700 }}>{c.value}</span>
              </div>
            ))}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Execution Log</div>
              {logs.map((log, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.includes('✓') ? 'var(--accent-green)' : log.includes('cache') ? 'var(--accent-cyan)' : log.includes('Heap') || log.includes('heap') ? 'var(--accent-purple)' : 'var(--text-secondary)', marginBottom: 3 }}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Results */}
          {topK.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(155,114,255,0.25)', borderRadius: 12, overflow: 'hidden' }} className="animate-fade-in">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Top {k} Customers by Spending</span>
                <Crown size={16} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div style={{ padding: '16px' }}>
                {topK.map((c, i) => (
                  <div key={c.customer_id} style={{ marginBottom: i < topK.length - 1 ? 12 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{MEDALS[i] || `#${i + 1}`}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{c.customer_id} · {c.order_count} orders</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: i === 0 ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                        {formatCurrency(c.total_spending)}
                      </div>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(c.total_spending / maxSpending) * 100}%`, background: i === 0 ? 'var(--accent-purple)' : i === 1 ? 'var(--accent-cyan)' : 'var(--accent-green)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Min-Heap visualization */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Min-Heap State (size k={k})</h3>
              {step === 'building_heap' && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>Building...</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {heapState.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Heap kosong — run query dulu</div>
              ) : (
                heapState.map((c, i) => (
                  <div key={c.customer_id} style={{ background: i === 0 ? 'var(--accent-purple-dim)' : 'var(--bg-secondary)', border: `1px solid ${i === 0 ? 'rgba(155,114,255,0.4)' : 'var(--border)'}`, borderRadius: 8, padding: '8px 12px', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: i === 0 ? 'var(--accent-purple)' : 'var(--text-muted)', marginBottom: 2 }}>{i === 0 ? 'MIN' : `#${i + 1}`}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{formatCurrency(c.total_spending)}</div>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Min-heap[0] = customer dengan spending terendah di top-K. Jika customer baru &gt; min, replace dan reheapify.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
