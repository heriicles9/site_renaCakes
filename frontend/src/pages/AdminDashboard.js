import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logout realizado!');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="bg-brand-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl font-bold">Painel Admin - Pedidos</h1>
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
        <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
          Total de Pedidos: {orders.length}
        </h2>

        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-brand-brown/60">Nenhum pedido recebido ainda.</p>
          </div>
        )}

        <div className="space-y-6">
          {orders.length > 0 && orders[0] && (
            <OrderCard order={orders[0]} />
          )}
          {orders.length > 1 && orders[1] && (
            <OrderCard order={orders[1]} />
          )}
          {orders.length > 2 && orders[2] && (
            <OrderCard order={orders[2]} />
          )}
          {orders.length > 3 && orders[3] && (
            <OrderCard order={orders[3]} />
          )}
          {orders.length > 4 && orders[4] && (
            <OrderCard order={orders[4]} />
          )}
          {orders.length > 5 && orders.slice(5).map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const items = order.items || [];
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-brand-pink/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-brand-brown">
            {order.customer_name}
          </h3>
          <p className="text-sm text-brand-brown/70">{order.customer_phone}</p>
          <p className="text-sm text-brand-brown/70">{order.customer_address}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-2xl text-brand-rose">
            R$ {order.total ? order.total.toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-brand-brown/60">
            {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : ''}
          </p>
        </div>
      </div>

      <div className="bg-brand-pink/10 p-4 rounded-lg mb-4">
        <p className="font-semibold text-brand-brown mb-3">Itens do Pedido:</p>
        
        {items.length > 0 && items[0] && <OrderItem item={items[0]} />}
        {items.length > 1 && items[1] && <OrderItem item={items[1]} />}
        {items.length > 2 && items[2] && <OrderItem item={items[2]} />}
        {items.length > 3 && items.slice(3).map((item, i) => (
          <OrderItem key={i} item={item} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-pink/20">
        <p className="text-sm text-brand-brown/70">
          <strong>Pagamento:</strong> {order.payment_method || 'N/A'}
        </p>
        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
          {order.status || 'Pendente'}
        </span>
      </div>
    </div>
  );
};

const OrderItem = ({ item }) => {
  const custom = item.customization;
  
  return (
    <div className="mb-3 pb-3 border-b border-brand-pink/30 last:border-0">
      <div className="flex justify-between">
        <p className="font-semibold text-brand-brown">
          {item.quantity}x {item.name}
        </p>
        <p className="font-bold text-brand-rose">
          R$ {item.price ? item.price.toFixed(2) : '0.00'}
        </p>
      </div>
      
      {custom && (
        <div className="mt-2 text-sm text-brand-brown/80 ml-4 space-y-1">
          {custom.massa && <p>🎂 Massa: {custom.massa}</p>}
          {custom.recheio && <p>🍰 Recheio: {custom.recheio}</p>}
          {custom.cobertura && <p>✨ Cobertura: {custom.cobertura}</p>}
          {custom.observacoes && (
            <p className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2">
              📝 {custom.observacoes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
