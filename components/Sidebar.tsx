'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, XCircle, Truck, BarChart3, Activity } from 'lucide-react';

const navItems = [
  { href: '/', icon: Activity, label: 'Dashboard', accent: '#00d4ff' },
  { href: '/place-order', icon: ShoppingCart, label: 'Place Order', accent: '#00e5a0' },
  { href: '/find-order', icon: Search, label: 'Find Order', accent: '#00d4ff' },
  { href: '/cancel-order', icon: XCircle, label: 'Cancel Order', accent: '#ff4d6d' },
  { href: '/ship-next', icon: Truck, label: 'Get Next to Ship', accent: '#ff8c42' },
  { href: '/top-customers', icon: BarChart3, label: 'Top K Customers', accent: '#9b72ff' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0
          }}>O</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>OrderSys</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>E-COMMERCE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 12px 6px', textTransform: 'uppercase' }}>Functions</div>
        {navItems.map(({ href, icon: Icon, label, accent }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: isActive ? accent : 'var(--text-secondary)',
                background: isActive ? `${accent}18` : 'transparent',
                border: `1px solid ${isActive ? `${accent}30` : 'transparent'}`,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
              }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span>{label}</span>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: accent }} className="pulse-dot" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} className="pulse-dot" />
            System Online
          </div>
          Hash Map · FIFO Queue · Min-Heap
        </div>
      </div>
    </aside>
  );
}
