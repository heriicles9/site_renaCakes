import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      products: [],
      loading: true
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin';
      return;
    }
    this.loadData();
  }

  async loadData() {
    try {
      const token = localStorage.getItem('admin_token');
      const ordersRes = await axios.get(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsRes = await axios.get(`${BACKEND_URL}/api/products`);
      
      this.setState({
        orders: ordersRes.data,
        products: productsRes.data,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.setState({ loading: false });
    }
  }

  handleLogout() {
    localStorage.removeItem('admin_token');
    toast.success('Logout realizado!');
    window.location.href = '/admin';
  }

  render() {
    const { orders, loading } = this.state;

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-brand-cream">
        <nav className="bg-brand-brown text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="font-heading text-2xl font-bold">Painel Administrativo</h1>
              <button
                onClick={this.handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
            Pedidos Recebidos ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-brand-brown/60">Nenhum pedido ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-md border border-brand-pink/20">
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
                        R$ {order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-brand-brown/60">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-brand-pink/10 p-4 rounded-lg mb-4">
                    <p className="font-semibold text-brand-brown mb-3">Itens do Pedido:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="mb-3 pb-3 border-b border-brand-pink/30 last:border-0">
                        <div className="flex justify-between">
                          <p className="font-semibold text-brand-brown">
                            {item.quantity}x {item.name}
                          </p>
                          <p className="font-bold text-brand-rose">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        
                        {item.customization && (
                          <div className="mt-2 text-sm text-brand-brown/80 ml-4 space-y-1">
                            <p>🎂 <strong>Massa:</strong> {item.customization.massa}</p>
                            <p>🍰 <strong>Recheio:</strong> {item.customization.recheio}</p>
                            <p>✨ <strong>Cobertura:</strong> {item.customization.cobertura}</p>
                            {item.customization.observacoes && (
                              <p className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2">
                                📝 <strong>Observações:</strong> {item.customization.observacoes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-pink/20">
                    <div className="text-sm text-brand-brown/70">
                      <p>
                        <strong>💳 Pagamento:</strong>{' '}
                        {order.payment_method === 'pix' && 'PIX'}
                        {order.payment_method === 'cartao' && 'Cartão (Maquininha na entrega)'}
                        {order.payment_method === 'dinheiro' && `Dinheiro${order.payment_details?.change_for ? ` - Troco: ${order.payment_details.change_for}` : ''}`}
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AdminDashboard;
