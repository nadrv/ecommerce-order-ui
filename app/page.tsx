'use client';
import { orderRepository, shippingQueue, customerSpending, formatCurrency, formatTimestamp } from '@/lib/store';
import { Package, Users, Truck, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const orders = Array.from(orderRepository.values());
  const activeOrders = orders.filter(o => o.active);
  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const customers = Array.from(customerSpending.values());
  const topCustomer = [...customers].sort((a, b) => b.total_spending - a.total_spending)[0];

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, accent: '#00d4ff', sub: `${activeOrders.length} active` },
    { label: 'Queue Length', value: shippingQueue.length, icon: Truck, accent: '#ff8c42', sub: 'FIFO order' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, accent: '#00e5a0', sub: 'all orders', large: true },
    { label: 'Customers', value: customers.length, icon: Users, accent: '#9b72ff', sub: 'registered' },
  ];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>System Overview</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Order Management Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Hash Map · FIFO Queue · Min-Heap Architecture</p>
      </div>

      <div className="animate-fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', borderTop: `2px solid ${stat.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ padding: 8, borderRadius: 8, background: `${stat.accent}18` }}>
                  <Icon size={16} style={{ color: stat.accent }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.sub}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: stat.large ? 18 : 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="animate-fade-in delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Order Repository</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-cyan)', background: 'var(--accent-cyan-dim)', padding: '2px 8px', borderRadius: 4 }}>Hash Map O(1)</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID','Customer','Amount','Time','Status'].map(h => (
                  <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id} style={{ borderBottom: '1px solid rgba(37,43,59,0.6)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-cyan)' }}>{order.order_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{order.customer_id}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{formatCurrency(order.total_amount)}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{formatTimestamp(order.timestamp)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: order.active ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: order.active ? 'var(--accent-green)' : 'var(--accent-red)', border: `1px solid ${order.active ? 'rgba(0,229,160,0.3)' : 'rgba(255,77,109,0.3)'}` }}>{order.active ? 'active' : 'canceled'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Shipping Queue</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-orange)', background: 'var(--accent-orange-dim)', padding: '2px 8px', borderRadius: 4 }}>FIFO</span>
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shippingQueue.map((orderId, idx) => {
              const order = orderRepository.get(orderId);
              return (
                <div key={orderId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: idx === 0 ? 'var(--accent-orange-dim)' : 'var(--bg-secondary)', border: `1px solid ${idx === 0 ? 'rgba(255,140,66,0.3)' : 'var(--border)'}` }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', width: 16, textAlign: 'center' }}>{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: idx === 0 ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{orderId}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order?.customer_id}</div>
                  </div>
                  {idx === 0 && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)' }}>NEXT</span>}
                  {!order?.active && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>SKIP</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="animate-fade-in delay-3" style={{ background: 'var(--bg-card)', border: '1px solid rgba(155,114,255,0.25)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top Spender</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{topCustomer?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{topCustomer?.customer_id} · {topCustomer?.order_count} orders</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent-purple)' }}>{formatCurrency(topCustomer?.total_spending || 0)}</div>
        </div>
      </div>
    </div>
  );
}
