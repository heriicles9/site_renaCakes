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
            {orders.length === 0 && (
              <p className="text-brand-brown/60 text-center py-10">Nenhum pedido recebido ainda.</p>
            )}
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 mb-4 shadow-md border border-brand-pink/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-brand-brown">{order.customer_name}</h3>
                    <p className="text-sm text-brand-brown/70">{order.customer_phone}</p>
                    <p className="text-sm text-brand-brown/70">{order.customer_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-brand-rose">R$ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-brand-brown/60">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-brand-brown mb-2">Itens do Pedido:</p>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-brand-pink/10 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-brand-brown">
                              {item.quantity}x {item.name}
                            </p>
                            {item.customization && (
                              <div className="mt-2 text-sm text-brand-brown/80 space-y-1">
                                <p>🎂 <strong>Massa:</strong> {item.customization.massa}</p>
                                <p>🍰 <strong>Recheio:</strong> {item.customization.recheio}</p>
                                <p>✨ <strong>Cobertura:</strong> {item.customization.cobertura}</p>
                                {item.customization.observacoes && (
                                  <p className="bg-yellow-50 p-2 rounded mt-2">
                                    📝 <strong>Obs:</strong> {item.customization.observacoes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="font-bold text-brand-rose ml-4">R$ {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-pink/20">
                  <div>
                    <p className="text-sm text-brand-brown/70">
                      <strong>Pagamento:</strong>{' '}
                      {order.payment_method === 'pix' && '💰 PIX'}
                      {order.payment_method === 'cartao' && '💳 Cartão (Maquininha)'}
                      {order.payment_method === 'dinheiro' && 
                        `💵 Dinheiro${order.payment_details?.change_for ? ` - Troco: ${order.payment_details.change_for}` : ''}`}
                    </p>
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Em preparo' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
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
