'use client';
import { useState } from 'react';
import { orderRepository, formatCurrency } from '@/lib/store';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { OrderRecord } from '@/lib/store';

type Step = 'idle' | 'looking' | 'checking' | 'canceling' | 'done' | 'not_found' | 'already_canceled';

export default function CancelOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [canceledOrder, setCanceledOrder] = useState<OrderRecord | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

  const handleCancel = async () => {
    if (!orderId.trim()) return;
    setLogs([]);
    setCanceledOrder(null);
    addLog(`1. cancelOrder(order_id="${orderId.trim()}")`);
    setStep('looking');
    await new Promise(r => setTimeout(r, 500));

    addLog('2. get(order_id) → Order Repository lookup');
    const order = orderRepository.get(orderId.trim());
    await new Promise(r => setTimeout(r, 600));

    if (!order) {
      addLog(`3. lookup(order_id) → NOT FOUND in Hash Map`);
      addLog('9. return fail');
      setStep('not_found');
      return;
    }

    addLog(`3. lookup(order_id) → found: ${orderId}`);
    setStep('checking');
    await new Promise(r => setTimeout(r, 400));

    if (!order.active) {
      addLog('→ [not found / already canceled] — order sudah inactive');
      addLog('9. return fail — already canceled');
      setStep('already_canceled');
      return;
    }

    addLog('→ [found] order aktif, melanjutkan pembatalan...');
    setStep('canceling');
    await new Promise(r => setTimeout(r, 500));

    addLog('4. set active = false (lazy deletion — tidak dihapus dari queue)');
    order.active = false;
    order.status = 'canceled';
    orderRepository.set(order.order_id, { ...order });
    await new Promise(r => setTimeout(r, 400));

    addLog('5. update(order) → Order Repository');
    await new Promise(r => setTimeout(r, 400));
    addLog('7. persist update → Database');
    await new Promise(r => setTimeout(r, 500));
    addLog('9. return success ✓');

    setCanceledOrder({ ...order });
    setStep('done');
  };

  const reset = () => { setStep('idle'); setCanceledOrder(null); setLogs([]); setOrderId(''); };

  const activeOrders = Array.from(orderRepository.values()).filter(o => o.active);
  const canceledOrders = Array.from(orderRepository.values()).filter(o => !o.active);
  const isRunning = step === 'looking' || step === 'checking' || step === 'canceling';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <XCircle size={18} style={{ color: 'var(--accent-red)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Function 3</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Cancel Order</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Lazy deletion — order tidak dihapus dari queue, hanya status diubah ke inactive</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Cancel Order</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Order ID</label>
              <input className="input-field" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. ORD-001" disabled={isRunning} />
            </div>

            {/* Active orders */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Orders</div>
              {activeOrders.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No active orders</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {activeOrders.map(o => (
                    <button key={o.order_id} onClick={() => setOrderId(o.order_id)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 6, background: orderId === o.order_id ? 'var(--accent-green-dim)' : 'var(--bg-secondary)', border: `1px solid ${orderId === o.order_id ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`, color: orderId === o.order_id ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer' }}>{o.order_id}</button>
                  ))}
                </div>
              )}
            </div>

            {step === 'done' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'var(--accent-red-dim)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-red)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-red)' }}>Canceled</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{canceledOrder?.order_id} — active = false</div>
                </div>
                <button className="btn btn-ghost" onClick={reset}>Reset</button>
              </div>
            ) : step === 'not_found' ? (
              <div style={{ background: 'var(--accent-red-dim)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--accent-red)', fontWeight: 600 }}>Order not found</div>
                <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 8, fontSize: 12 }}>Try Again</button>
              </div>
            ) : step === 'already_canceled' ? (
              <div style={{ background: 'var(--accent-orange-dim)', border: '1px solid rgba(255,140,66,0.3)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 600 }}>Already canceled</div>
                <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 8, fontSize: 12 }}>Try Again</button>
              </div>
            ) : (
              <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleCancel} disabled={isRunning || !orderId.trim()}>
                {isRunning ? <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> Processing...</> : <><XCircle size={14} /> Cancel Order</>}
              </button>
            )}
          </div>

          {/* Canceled orders */}
          {canceledOrders.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Canceled Orders (lazy deletion)</div>
              {canceledOrders.map(o => (
                <div key={o.order_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-red)' }}>{o.order_id}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>still in queue (skipped)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sequence + Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sequence Flow — alt [found / not found]</h3>
            {[
              { s: 'looking', label: 'cancelOrder(order_id)', color: undefined },
              { s: 'checking', label: 'lookup(order_id) in Hash Map', color: undefined },
              { s: 'canceling', label: '[found] set active = false', color: 'var(--accent-orange)' },
              { s: 'done', label: 'persist update → return success', color: 'var(--accent-green)' },
              { s: 'not_found', label: '[not found] return fail', color: 'var(--accent-red)' },
            ].map(s => {
              const isActive = step === s.s;
              return (
                <div key={s.s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: isActive ? (s.color || 'var(--accent-cyan)') : 'var(--border)', transition: 'background 0.3s' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? (s.color || 'var(--accent-cyan)') : 'var(--text-muted)', transition: 'color 0.3s' }}>{s.label}</div>
                </div>
              );
            })}

            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-orange-dim)', border: '1px solid rgba(255,140,66,0.3)', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} style={{ color: 'var(--accent-orange)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-orange)', marginBottom: 4 }}>Lazy Deletion</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Order tidak dihapus dari Shipping Queue. Saat ship, order dengan active=false akan di-skip secara otomatis.</div>
                </div>
              </div>
            </div>
          </div>

          {logs.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Execution Log</div>
              {logs.map((log, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.includes('success') ? 'var(--accent-green)' : log.includes('fail') || log.includes('NOT FOUND') ? 'var(--accent-red)' : log.includes('lazy') || log.includes('active = false') ? 'var(--accent-orange)' : 'var(--text-secondary)', marginBottom: 3 }}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
