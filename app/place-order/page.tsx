'use client';
import { useState } from 'react';
import { orderRepository, shippingQueue, customerSpending, generateOrderId, formatCurrency } from '@/lib/store';
import { ShoppingCart, Plus, Trash2, CheckCircle, ArrowRight } from 'lucide-react';

type Step = 'idle' | 'validating' | 'generating' | 'saving' | 'enqueueing' | 'persisting' | 'done';

const STEPS: { key: Step; label: string; desc: string }[] = [
  { key: 'validating', label: '2. validate(order)', desc: 'Order Service memvalidasi data order' },
  { key: 'generating', label: '3. generate order_id & timestamp', desc: 'Generate unique ID dan timestamp FIFO' },
  { key: 'saving', label: '4. save(order) → Hash Map', desc: 'Order Repository menyimpan ke Hash Map O(1)' },
  { key: 'enqueueing', label: '6. enqueue(order_id) → Queue', desc: 'Order ID dimasukkan ke Shipping Queue (FIFO)' },
  { key: 'persisting', label: '8. persist(order) → Database', desc: 'Data dipersist ke Database' },
  { key: 'done', label: '10. return order_id', desc: 'Order berhasil dibuat, return order_id' },
];

export default function PlaceOrderPage() {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<string[]>(['']);
  const [amounts, setAmounts] = useState<number[]>([0]);
  const [currentStep, setCurrentStep] = useState<Step>('idle');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [resultOrderId, setResultOrderId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

  const runStep = async (steps: typeof STEPS, idx: number, orderId: string, totalAmount: number) => {
    if (idx >= steps.length) return;
    const step = steps[idx];
    setCurrentStep(step.key);
    addLog(`→ ${step.label}`);
    await new Promise(r => setTimeout(r, 700));
    setCompletedSteps(prev => [...prev, step.key]);

    if (step.key === 'saving') {
      const order = {
        order_id: orderId,
        customer_id: customerId,
        total_amount: totalAmount,
        timestamp: Date.now(),
        active: true,
        status: 'active' as const,
        items: items.filter(Boolean),
      };
      orderRepository.set(orderId, order);
      addLog(`✓ Saved to Hash Map: ${orderId} → ${formatCurrency(totalAmount)}`);

      // Update customer spending
      const existing = customerSpending.get(customerId);
      if (existing) {
        existing.total_spending += totalAmount;
        existing.order_count += 1;
      } else {
        customerSpending.set(customerId, { customer_id: customerId, name: customerId, total_spending: totalAmount, order_count: 1 });
      }
    }
    if (step.key === 'enqueueing') {
      shippingQueue.push(orderId);
      addLog(`✓ Enqueued: position ${shippingQueue.length} in FIFO queue`);
    }

    await runStep(steps, idx + 1, orderId, totalAmount);
  };

  const handleSubmit = async () => {
    if (!customerId.trim()) return;
    const totalAmount = amounts.reduce((a, b) => a + (b || 0), 0);
    const orderId = generateOrderId();
    setResultOrderId(orderId);
    setCompletedSteps([]);
    setLogs([]);
    addLog(`1. placeOrder(order) received — customer: ${customerId}`);
    await runStep(STEPS, 0, orderId, totalAmount);
    setCurrentStep('done');
  };

  const reset = () => {
    setCurrentStep('idle');
    setCompletedSteps([]);
    setResultOrderId('');
    setLogs([]);
    setCustomerId('');
    setItems(['']);
    setAmounts([0]);
  };

  const totalAmount = amounts.reduce((a, b) => a + (b || 0), 0);
  const isRunning = currentStep !== 'idle' && currentStep !== 'done';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShoppingCart size={18} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Function 1</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Place Order</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Validate → Generate ID → Save Hash Map → Enqueue FIFO → Persist DB</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>Order Details</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Customer ID</label>
            <input
              className="input-field"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              placeholder="e.g. CUST-001"
              disabled={isRunning}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</label>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setItems([...items, '']); setAmounts([...amounts, 0]); }} disabled={isRunning}>
                <Plus size={12} /> Add Item
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="input-field" value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }} placeholder={`Item ${i + 1}`} disabled={isRunning} style={{ flex: 2 }} />
                <input className="input-field" type="number" value={amounts[i] || ''} onChange={e => { const n = [...amounts]; n[i] = Number(e.target.value); setAmounts(n); }} placeholder="Rp" disabled={isRunning} style={{ flex: 1 }} />
                {items.length > 1 && (
                  <button onClick={() => { setItems(items.filter((_, j) => j !== i)); setAmounts(amounts.filter((_, j) => j !== i)); }} disabled={isRunning} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Amount</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
            </span>
          </div>

          {currentStep === 'done' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'var(--accent-green-dim)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-green)', marginBottom: 4 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-green)', fontWeight: 700 }}>{resultOrderId}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Order created</div>
              </div>
              <button className="btn btn-ghost" onClick={reset} style={{ flexShrink: 0 }}>New Order</button>
            </div>
          ) : (
            <button className="btn btn-success" style={{ width: '100%' }} onClick={handleSubmit} disabled={isRunning || !customerId.trim()}>
              {isRunning ? <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} /> Processing...</> : <><ShoppingCart size={14} /> Place Order</>}
            </button>
          )}
        </div>

        {/* Sequence flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sequence Flow</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STEPS.map((step, i) => {
                const isDone = completedSteps.includes(step.key);
                const isActive = currentStep === step.key;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-cyan-dim)' : 'var(--bg-secondary)', border: `1px solid ${isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-cyan)' : 'var(--border)'}`, transition: 'all 0.3s ease' }}>
                      {isDone ? <CheckCircle size={12} style={{ color: '#000' }} /> : isActive ? <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'block' }} /> : <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', transition: 'color 0.3s', fontWeight: isActive ? 700 : 400 }}>{step.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Execution Log</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.startsWith('✓') ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
