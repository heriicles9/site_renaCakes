import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      nav('/admin');
      return;
    }
    loadOrders();
  }, [nav]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand-brown text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-2xl font-bold">Admin</h1>
          <button onClick={() => { localStorage.removeItem('admin_token'); nav('/admin'); }} className="bg-white/20 px-4 py-2 rounded">Sair</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Pedidos ({orders.length})</h2>
        
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-lg p-6 mb-4 shadow">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{o.customer_name}</h3>
                <p className="text-sm">{o.customer_phone}</p>
                <p className="text-sm">{o.customer_address}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-red-600">R$ {o.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold mb-2">Itens:</p>
              {o.items.map((item, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold">{item.quantity}x {item.name}</p>
                  {item.customization && (
                    <div className="text-sm ml-4 mt-1 text-gray-700">
                      <p>Massa: {item.customization.massa}</p>
                      <p>Recheio: {item.customization.recheio}</p>
                      <p>Cobertura: {item.customization.cobertura}</p>
                      {item.customization.observacoes && <p className="bg-yellow-100 p-2 mt-1 rounded">Obs: {item.customization.observacoes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <p className="text-sm">Pagamento: {o.payment_method}</p>
              <span className="bg-yellow-200 px-3 py-1 rounded">{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
