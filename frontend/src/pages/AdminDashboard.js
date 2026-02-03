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
  const [filter, setFilter] = useState('all');

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Status atualizado!');
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteOrder = async (orderId, customerName) => {
    if (!window.confirm(`Tem certeza que deseja DELETAR o pedido de ${customerName}?\n\nEsta ação NÃO pode ser desfeita!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(
        `${API}/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Pedido deletado com sucesso!');
      loadOrders();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      toast.error('Erro ao deletar pedido');
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

  const pendingOrders = orders.filter(o => o.status === 'Pendente');
  const preparingOrders = orders.filter(o => o.status === 'Em preparo');
  const completedOrders = orders.filter(o => o.status === 'Feito');

  const getFilteredOrders = () => {
    if (filter === 'Pendente') return pendingOrders;
    if (filter === 'Em preparo') return preparingOrders;
    if (filter === 'Feito') return completedOrders;
    return orders;
  };

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-3xl font-bold text-brand-brown">
            Gerenciar Pedidos
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === 'all' ? 'bg-brand-brown text-white' : 'bg-white text-brand-brown border border-brand-pink'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('Pendente')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === 'Pendente' ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-700 border border-yellow-300'
              }`}
            >
              Pendente ({pendingOrders.length})
            </button>
            <button
              onClick={() => setFilter('Em preparo')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === 'Em preparo' ? 'bg-blue-500 text-white' : 'bg-white text-blue-700 border border-blue-300'
              }`}
            >
              Em Preparo ({preparingOrders.length})
            </button>
            <button
              onClick={() => setFilter('Feito')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === 'Feito' ? 'bg-green-500 text-white' : 'bg-white text-green-700 border border-green-300'
              }`}
            >
              Feito ({completedOrders.length})
            </button>
          </div>
        </div>

        {getFilteredOrders().length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-brand-brown/60">
              {filter === 'all' ? 'Nenhum pedido recebido ainda.' : `Nenhum pedido ${filter}.`}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {getFilteredOrders().length > 0 && getFilteredOrders()[0] && (
            <OrderCard order={getFilteredOrders()[0]} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          )}
          {getFilteredOrders().length > 1 && getFilteredOrders()[1] && (
            <OrderCard order={getFilteredOrders()[1]} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          )}
          {getFilteredOrders().length > 2 && getFilteredOrders()[2] && (
            <OrderCard order={getFilteredOrders()[2]} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          )}
          {getFilteredOrders().length > 3 && getFilteredOrders()[3] && (
            <OrderCard order={getFilteredOrders()[3]} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          )}
          {getFilteredOrders().length > 4 && getFilteredOrders()[4] && (
            <OrderCard order={getFilteredOrders()[4]} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          )}
          {getFilteredOrders().length > 5 && getFilteredOrders().slice(5).map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusChange }) => {
  const items = order.items || [];
  
  const getStatusColor = (status) => {
    if (status === 'Pendente') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === 'Em preparo') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (status === 'Feito') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
      order.status === 'Pendente' ? 'border-yellow-300' :
      order.status === 'Em preparo' ? 'border-blue-300' :
      order.status === 'Feito' ? 'border-green-300' : 'border-brand-pink/20'
    }`}>
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

      <div className="flex items-center justify-between pt-4 border-t border-brand-pink/20 gap-4">
        <div className="flex-1">
          <p className="text-sm text-brand-brown/70 mb-2">
            <strong>💳 Pagamento:</strong> {order.payment_method || 'N/A'}
          </p>
          <div>
            <label className="text-sm font-semibold text-brand-brown block mb-2">
              Mudar Status:
            </label>
            <select
              value={order.status || 'Pendente'}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className={`w-full px-4 py-2 rounded-full text-sm font-semibold border-2 cursor-pointer transition-all ${getStatusColor(order.status)}`}
            >
              <option value="Pendente">🟡 Pendente</option>
              <option value="Em preparo">🔵 Em Preparo</option>
              <option value="Feito">🟢 Feito</option>
            </select>
          </div>
        </div>
        <div>
          <span className={`px-6 py-3 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
            {order.status === 'Pendente' && '🟡 '}
            {order.status === 'Em preparo' && '🔵 '}
            {order.status === 'Feito' && '🟢 '}
            {order.status || 'Pendente'}
          </span>
        </div>
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
