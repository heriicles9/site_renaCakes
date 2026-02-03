import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
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
      const prodsRes = await axios.get(`${API}/products`);
      setProducts(prodsRes.data);
      
      const token = localStorage.getItem('admin_token');
      const ordersRes = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logout realizado!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="bg-brand-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl font-bold">Painel Admin</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${
              activeTab === 'products' ? 'bg-brand-brown text-white' : 'bg-white text-brand-brown'
            }`}
          >
            <Package size={20} />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${
              activeTab === 'orders' ? 'bg-brand-brown text-white' : 'bg-white text-brand-brown'
            }`}
          >
            <ShoppingCart size={20} />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${
              activeTab === 'settings' ? 'bg-brand-brown text-white' : 'bg-white text-brand-brown'
            }`}
          >
            <Settings size={20} />
            Config
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
              Produtos ({products.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-md">
                  <h3 className="font-bold text-brand-brown">{product.name}</h3>
                  <p className="text-brand-rose font-bold">R$ {product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
              Pedidos ({orders.length})
            </h2>
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 mb-4 shadow-md">
                <h3 className="font-bold text-brand-brown">{order.customer_name}</h3>
                <p>Total: R$ {order.total.toFixed(2)}</p>
                <p>Status: {order.status}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
              Configurações
            </h2>
            <p className="text-brand-brown">Painel de configurações em breve...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
