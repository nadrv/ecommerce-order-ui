'use client';
import { useState } from 'react';
import { orderRepository, shippingQueue, formatCurrency, formatTimestamp } from '@/lib/store';
import { Truck, SkipForward, CheckCircle } from 'lucide-react';
import type { OrderRecord } from '@/lib/store';

type Step = 'idle' | 'peeking' | 'checking' | 'skipping' | 'shipping' | 'done' | 'empty';

export default function ShipNextPage() {
  const [step, setStep] = useState<Step>('idle');
  const [shippedOrder, setShippedOrder] = useState<OrderRecord | null>(null);
  const [skippedOrders, setSkippedOrders] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loopCount, setLoopCount] = useState(0);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

  const handleGetNext = async () => {
    setLogs([]);
    setSkippedOrders([]);
    setShippedOrder(null);
    setLoopCount(0);
    const skipped: string[] = [];

    addLog('1. getNextOrderToShip()');
    setStep('peeking');
    await new Promise(r => setTimeout(r, 500));

    addLog('2. peek() → Shipping Queue front');

    let loop = 0;
    while (true) {
      if (shippingQueue.length === 0) {
        addLog('Queue kosong — tidak ada order untuk dikirim');
        setStep('empty');
        return;
      }

      const frontId = shippingQueue[0];
      loop++;
      setLoopCount(loop);
      addLog(`[loop] front() → ${frontId}`);
      setStep('checking');
      await new Promise(r => setTimeout(r, 500));

      const order = orderRepository.get(frontId);
      addLog(`isActive? ${order?.active ? 'true ✓' : 'false — canceled, skip'}`);
      await new Promise(r => setTimeout(r, 400));

      if (!order || !order.active) {
        // Skip — lazy deletion
        shippingQueue.shift();
        skipped.push(frontId);
        setSkippedOrders([...skipped]);
        addLog(`pop() — skip ${frontId} (canceled)`);
        setStep('skipping');
        await new Promise(r => setTimeout(r, 400));
        continue;
      }

      // Found active order
      addLog(`isActive? true → pop() ${frontId}`);
      setStep('shipping');
      await new Promise(r => setTimeout(r, 600));

      shippingQueue.shift();
      order.status = 'shipped';
      orderRepository.set(frontId, { ...order });

      addLog(`✓ 11. return active order: ${frontId}`);
      setShippedOrder({ ...order });
      setStep('done');
      return;
    }
  };

  const reset = () => { setStep('idle'); setShippedOrder(null); setSkippedOrders([]); setLogs([]); setLoopCount(0); };

  const queuePreview = shippingQueue.slice(0, 8);
  const isRunning = step === 'peeking' || step === 'checking' || step === 'skipping' || step === 'shipping';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Truck size={18} style={{ color: 'var(--accent-orange)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-orange)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Function 4</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Get Next Order to Ship</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>FIFO Queue · Canceled orders di-skip (lazy deletion) · Loop sampai active order ditemukan</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Queue state */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Shipping Queue</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-orange)', background: 'var(--accent-orange-dim)', padding: '2px 8px', borderRadius: 4 }}>FIFO</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{shippingQueue.length} items</span>
              </div>
            </div>
            <div style={{ padding: '12px' }}>
              {shippingQueue.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Queue kosong</div>
              ) : (
                queuePreview.map((orderId, idx) => {
                  const order = orderRepository.get(orderId);
                  const isSkipped = skippedOrders.includes(orderId);
                  const isFront = idx === 0;
                  return (
                    <div key={orderId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 5, background: isSkipped ? 'var(--accent-red-dim)' : isFront && (step === 'peeking' || step === 'checking' || step === 'shipping') ? 'var(--accent-orange-dim)' : 'var(--bg-secondary)', border: `1px solid ${isSkipped ? 'rgba(255,77,109,0.3)' : isFront ? 'rgba(255,140,66,0.3)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', width: 14 }}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: isSkipped ? 'var(--accent-red)' : isFront ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{orderId}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{order?.customer_id}</span>
                      </div>
                      {!order?.active && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-red)' }}>CANCELED</span>}
                      {isFront && order?.active && (step === 'checking' || step === 'shipping') && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-orange)' }}>← FRONT</span>}
                      {isSkipped && <SkipForward size={12} style={{ color: 'var(--accent-red)' }} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Result */}
          {step === 'done' && shippedOrder && (
            <div style={{ background: 'var(--accent-green-dim)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 12, padding: 20 }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Truck size={16} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>Active Order Found — Ready to Ship</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Order ID', value: shippedOrder.order_id },
                  { label: 'Customer', value: shippedOrder.customer_id },
                  { label: 'Amount', value: formatCurrency(shippedOrder.total_amount) },
                  { label: 'Loop iterations', value: `${loopCount}x` },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {skippedOrders.length > 0 && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--accent-red-dim)', borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent-red)' }}>Skipped: {skippedOrders.join(', ')} (lazy deletion)</span>
                </div>
              )}
              <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 12, fontSize: 12 }}>Reset</button>
            </div>
          )}

          {step === 'empty' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Queue sudah kosong</p>
              <button className="btn btn-ghost" onClick={reset} style={{ marginTop: 12 }}>Reset</button>
            </div>
          )}

          {(step === 'idle' || (step !== 'done' && step !== 'empty')) && (
            <button className="btn" style={{ background: 'var(--accent-orange)', color: '#000', fontWeight: 700 }} onClick={handleGetNext} disabled={isRunning || shippingQueue.length === 0}>
              {isRunning ? <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} /> Processing...</> : <><Truck size={14} /> Get Next Order to Ship</>}
            </button>
          )}
        </div>

        {/* Right: sequence + logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sequence Flow — loop [queue not empty and front is canceled]</h3>
            {[
              { s: 'peeking', label: 'getNextOrderToShip() → peek()', desc: 'Lihat elemen terdepan queue', color: 'var(--accent-orange)' },
              { s: 'checking', label: 'front() → get(order_id) → isActive?', desc: 'Cek apakah order masih aktif', color: 'var(--accent-cyan)' },
              { s: 'skipping', label: 'pop() — skip canceled order', desc: 'Loop: cek order berikutnya', color: 'var(--accent-red)' },
              { s: 'shipping', label: 'isActive? true → pop()', desc: 'Order aktif ditemukan!', color: 'var(--accent-green)' },
              { s: 'done', label: '11. return active order', desc: 'Return order siap kirim', color: 'var(--accent-green)' },
            ].map(s => {
              const isActive = step === s.s;
              return (
                <div key={s.s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: isActive ? s.color : 'var(--border)', transition: 'background 0.3s' }} className={isActive ? 'pulse-dot' : ''} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? s.color : 'var(--text-muted)', transition: 'color 0.3s', fontWeight: isActive ? 700 : 400 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {logs.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', maxHeight: 260, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Execution Log</div>
              {logs.map((log, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.includes('✓') ? 'var(--accent-green)' : log.includes('skip') || log.includes('canceled') ? 'var(--accent-red)' : log.includes('loop') ? 'var(--accent-orange)' : 'var(--text-secondary)', marginBottom: 3 }}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
