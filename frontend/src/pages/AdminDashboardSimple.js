import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const p = await axios.get(`${API}/products`);
      setProducts(p.data);
      
      const token = localStorage.getItem('admin_token');
      const o = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(o.data);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logout!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="bg-brand-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-heading text-2xl font-bold">Admin</h1>
          <button onClick={logout} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('products')}
            className={`px-6 py-3 rounded-full font-semibold ${tab === 'products' ? 'bg-brand-brown text-white' : 'bg-white'}`}
          >
            Produtos ({products.length})
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-6 py-3 rounded-full font-semibold ${tab === 'orders' ? 'bg-brand-brown text-white' : 'bg-white'}`}
          >
            Pedidos ({orders.length})
          </button>
        </div>

        {tab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-4 shadow">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.category}</p>
                <p className="font-bold text-brand-rose mt-2">R$ {p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-center py-10">Nenhum pedido ainda</p>}
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-xl p-6 shadow">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{o.customer_name}</h3>
                    <p className="text-sm">{o.customer_phone}</p>
                    <p className="text-sm">{o.customer_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-brand-rose">R$ {o.total.toFixed(2)}</p>
                    <p className="text-xs">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="bg-brand-pink/20 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Itens:</p>
                  {o.items && o.items.map((item, i) => (
                    <div key={i} className="mb-3 pb-3 border-b border-brand-pink/30 last:border-0">
                      <p className="font-semibold">{item.quantity}x {item.name} - R$ {item.price.toFixed(2)}</p>
                      {item.customization && (
                        <div className="text-sm mt-2 ml-4 space-y-1">
                          <p>🎂 Massa: {item.customization.massa}</p>
                          <p>🍰 Recheio: {item.customization.recheio}</p>
                          <p>✨ Cobertura: {item.customization.cobertura}</p>
                          {item.customization.observacoes && (
                            <p className="bg-yellow-100 p-2 rounded mt-1">
                              📝 {item.customization.observacoes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm">
                    💳 {o.payment_method === 'pix' && 'PIX'}
                    {o.payment_method === 'cartao' && 'Cartão'}
                    {o.payment_method === 'dinheiro' && 'Dinheiro'}
                  </p>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
