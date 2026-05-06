'use client';
import { useState } from 'react';
import { orderRepository, formatCurrency, formatTimestamp } from '@/lib/store';
import { Search, CheckCircle, XCircle, Hash, Clock } from 'lucide-react';
import type { OrderRecord } from '@/lib/store';

type SearchStep = 'idle' | 'searching' | 'lookup' | 'found' | 'not_found';

export default function FindOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState<SearchStep>('idle');
  const [result, setResult] = useState<OrderRecord | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    setStep('searching');
    setResult(null);
    setLogs([]);
    addLog(`1. findOrder(order_id="${orderId.trim()}")`);
    await new Promise(r => setTimeout(r, 400));

    addLog('2. get(order_id) → Order Repository');
    setStep('lookup');
    await new Promise(r => setTimeout(r, 500));

    addLog('3. lookup(order_id) in Hash Map — O(1) avg');
    await new Promise(r => setTimeout(r, 600));

    const found = orderRepository.get(orderId.trim());
    if (found) {
      addLog(`4. order_record found → ${orderId}`);
      await new Promise(r => setTimeout(r, 300));
      addLog('5. return order ✓');
      setResult(found);
      setStep('found');
    } else {
      addLog(`4. not found — key "${orderId}" does not exist in Hash Map`);
      await new Promise(r => setTimeout(r, 300));
      addLog('5. return not_found');
      setStep('not_found');
    }
  };

  const reset = () => { setStep('idle'); setResult(null); setLogs([]); setOrderId(''); };

  const allOrders = Array.from(orderRepository.keys());

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Search size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Function 2</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Find Order</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Pencarian menggunakan Hash Map → O(1) average lookup</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Search by Order ID</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input className="input-field" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. ORD-001" onKeyDown={e => e.key === 'Enter' && handleSearch()} disabled={step === 'searching' || step === 'lookup'} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handleSearch} disabled={!orderId.trim() || step === 'searching' || step === 'lookup'}>
                <Search size={14} />
              </button>
            </div>

            {/* Quick select */}
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Select</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allOrders.map(id => (
                  <button key={id} onClick={() => setOrderId(id)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 6, background: orderId === id ? 'var(--accent-cyan-dim)' : 'var(--bg-secondary)', border: `1px solid ${orderId === id ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`, color: orderId === id ? 'var(--accent-cyan)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                    {id}
                  </button>
                ))}
                <button key="invalid" onClick={() => setOrderId('ORD-999')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  ORD-999 (invalid)
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          {step === 'found' && result && (
            <div style={{ background: 'var(--accent-green-dim)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 12, padding: 20 }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>Order Found</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Order ID', value: result.order_id, mono: true, color: 'var(--accent-cyan)' },
                  { label: 'Customer', value: result.customer_id, mono: true },
                  { label: 'Amount', value: formatCurrency(result.total_amount), mono: true, color: 'var(--accent-green)' },
                  { label: 'Timestamp', value: formatTimestamp(result.timestamp), mono: true },
                  { label: 'Status', value: result.active ? 'active' : 'canceled', mono: true, color: result.active ? 'var(--accent-green)' : 'var(--accent-red)' },
                  { label: 'Items', value: result.items.join(', ') },
                ].map(field => (
                  <div key={field.label}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{field.label}</div>
                    <div style={{ fontSize: 12, color: field.color || 'var(--text-primary)', fontFamily: field.mono ? 'var(--font-mono)' : 'inherit' }}>{field.value}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 14, fontSize: 12 }}>New Search</button>
            </div>
          )}

          {step === 'not_found' && (
            <div style={{ background: 'var(--accent-red-dim)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 12, padding: 20 }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <XCircle size={16} style={{ color: 'var(--accent-red)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-red)' }}>Order Not Found</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Key <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>"{orderId}"</span> tidak ditemukan di Hash Map.</p>
              <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 12, fontSize: 12 }}>Try Again</button>
            </div>
          )}
        </div>

        {/* Sequence + logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sequence Flow — alt [order found / not found]</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: 'searching', label: 'findOrder(order_id)', desc: 'Request masuk ke Order Controller' },
                { step: 'lookup', label: 'lookup(order_id) → Hash Map', desc: 'O(1) average complexity lookup' },
                { step: 'found', label: '[found] return order_record', desc: 'Data dikembalikan dari Hash Map', color: 'var(--accent-green)' },
                { step: 'not_found', label: '[not found] return not_found', desc: 'Key tidak ada di Hash Map', color: 'var(--accent-red)' },
              ].map(s => {
                const isActive = step === s.step;
                const isDone = (step === 'found' || step === 'not_found') && (s.step === 'searching' || s.step === 'lookup');
                return (
                  <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: isActive ? (s.color || 'var(--accent-cyan)') : isDone ? 'var(--accent-green)' : 'var(--border)', transition: 'background 0.3s' }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? (s.color || 'var(--accent-cyan)') : isDone ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'color 0.3s' }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: 4 }}>COMPLEXITY</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-green)' }}>O(1) avg</span><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>Hash Map lookup</span></div>
              </div>
            </div>
          </div>

          {logs.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Execution Log</div>
              {logs.map((log, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.includes('found →') ? 'var(--accent-green)' : log.includes('not found') ? 'var(--accent-red)' : 'var(--text-secondary)', marginBottom: 3 }}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
