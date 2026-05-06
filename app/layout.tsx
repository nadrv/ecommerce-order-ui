import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ToastContainer from '@/components/Toast';

export const metadata: Metadata = {
  title: 'OrderSys — E-Commerce Order System',
  description: 'E-Commerce Order Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
