export type OrderStatus = 'active' | 'canceled' | 'shipped';

export interface OrderRecord {
  order_id: string;
  customer_id: string;
  total_amount: number;
  timestamp: number;
  active: boolean;
  status: OrderStatus;
  items: string[];
}

export interface Customer {
  customer_id: string;
  name: string;
  total_spending: number;
  order_count: number;
}

// Static base timestamp to avoid SSR/client mismatch
const BASE_TS = 1746518400000; // fixed, tidak pakai Date.now()

// In-memory Hash Map: order_id -> order_record
export const orderRepository: Map<string, OrderRecord> = new Map([
 
]);

// Shipping Queue: FIFO based on timestamp
export const shippingQueue: string[] = ['ORD-001', 'ORD-002', 'ORD-003', 'ORD-004', 'ORD-005', 'ORD-006'];

// Customer Spending Service: customer_id -> total_spending
export const customerSpending: Map<string, Customer> = new Map([
  
]);

let orderCounter = 7;
export const generateOrderId = () => {
  const id = `ORD-${String(orderCounter).padStart(3, '0')}`;
  orderCounter++;
  return id;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const formatTimestamp = (ts: number) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });