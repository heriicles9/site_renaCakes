import React from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      filter: 'all',
      loading: true
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin';
      return;
    }
    this.loadOrders();
  }

  loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ orders: res.data, loading: false });
    } catch (error) {
      console.error('Erro:', error);
      this.setState({ loading: false });
    }
  }

  handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status atualizado!');
      this.loadOrders();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar status');
    }
  }

  handleDelete = async (orderId, name) => {
    if (!window.confirm(`Deletar pedido de ${name}?`)) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pedido deletado!');
      this.loadOrders();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar');
    }
  }

  handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  }

  getFilteredOrders = () => {
    const { orders, filter } = this.state;
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }

  render() {
    const { orders, filter, loading } = this.state;
    
    if (loading) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
        React.createElement('p', { className: 'text-xl' }, 'Carregando...')
      );
    }

    const pendingCount = orders.filter(o => o.status === 'Pendente').length;
    const preparingCount = orders.filter(o => o.status === 'Em preparo').length;
    const doneCount = orders.filter(o => o.status === 'Feito').length;
    const filteredOrders = this.getFilteredOrders();

    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
      React.createElement('nav', { className: 'bg-pink-900 text-white p-4' },
        React.createElement('div', { className: 'max-w-7xl mx-auto flex justify-between items-center' },
          React.createElement('h1', { className: 'text-2xl font-bold' }, 'Admin - Pedidos'),
          React.createElement('button', {
            onClick: this.handleLogout,
            className: 'bg-white/20 px-4 py-2 rounded hover:bg-white/30'
          }, 'Sair')
        )
      ),
      React.createElement('div', { className: 'max-w-7xl mx-auto p-6' },
        React.createElement('div', { className: 'flex gap-3 mb-8' },
          React.createElement('button', {
            onClick: () => this.setState({ filter: 'all' }),
            className: `px-4 py-2 rounded-full font-semibold ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white'}`
          }, `Todos (${orders.length})`),
          React.createElement('button', {
            onClick: () => this.setState({ filter: 'Pendente' }),
            className: `px-4 py-2 rounded-full font-semibold ${filter === 'Pendente' ? 'bg-yellow-500 text-white' : 'bg-white'}`
          }, `Pendente (${pendingCount})`),
          React.createElement('button', {
            onClick: () => this.setState({ filter: 'Em preparo' }),
            className: `px-4 py-2 rounded-full font-semibold ${filter === 'Em preparo' ? 'bg-blue-500 text-white' : 'bg-white'}`
          }, `Em Preparo (${preparingCount})`),
          React.createElement('button', {
            onClick: () => this.setState({ filter: 'Feito' }),
            className: `px-4 py-2 rounded-full font-semibold ${filter === 'Feito' ? 'bg-green-500 text-white' : 'bg-white'}`
          }, `Feito (${doneCount})`)
        ),
        React.createElement('div', { className: 'space-y-4' },
          filteredOrders.length === 0 && React.createElement('p', { className: 'text-center py-20 text-gray-500' }, 'Nenhum pedido'),
          filteredOrders.map(order => 
            React.createElement('div', {
              key: order.id,
              className: `bg-white rounded-lg p-6 shadow border-2 ${
                order.status === 'Pendente' ? 'border-yellow-300' :
                order.status === 'Em preparo' ? 'border-blue-300' : 'border-green-300'
              }`
            },
              React.createElement('div', { className: 'flex justify-between mb-4' },
                React.createElement('div', null,
                  React.createElement('h3', { className: 'text-xl font-bold' }, order.customer_name),
                  React.createElement('p', { className: 'text-sm' }, order.customer_phone),
                  React.createElement('p', { className: 'text-sm' }, order.customer_address)
                ),
                React.createElement('div', { className: 'flex items-start gap-4' },
                  React.createElement('div', { className: 'text-right' },
                    React.createElement('p', { className: 'text-2xl font-bold text-red-600' }, `R$ ${order.total.toFixed(2)}`),
                    React.createElement('p', { className: 'text-xs' }, new Date(order.created_at).toLocaleDateString('pt-BR'))
                  ),
                  React.createElement('button', {
                    onClick: () => this.handleDelete(order.id, order.customer_name),
                    className: 'text-red-500 hover:bg-red-50 p-2 rounded',
                    title: 'Deletar'
                  }, '🗑️')
                )
              ),
              React.createElement('div', { className: 'bg-gray-100 p-4 rounded mb-4' },
                React.createElement('p', { className: 'font-semibold mb-2' }, 'Itens:'),
                order.items && order.items.map((item, i) =>
                  React.createElement('div', { key: i, className: 'mb-3' },
                    React.createElement('p', { className: 'font-semibold' }, `${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}`),
                    item.customization && React.createElement('div', { className: 'text-sm ml-4 mt-1' },
                      React.createElement('p', null, `Massa: ${item.customization.massa}`),
                      React.createElement('p', null, `Recheio: ${item.customization.recheio}`),
                      React.createElement('p', null, `Cobertura: ${item.customization.cobertura}`),
                      item.customization.observacoes && React.createElement('p', { className: 'bg-yellow-100 p-2 rounded mt-1' }, `Obs: ${item.customization.observacoes}`)
                    )
                  )
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center pt-4 border-t' },
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('p', { className: 'text-sm mb-2' }, `Pagamento: ${order.payment_method}`),
                  React.createElement('select', {
                    value: order.status,
                    onChange: (e) => this.handleStatusChange(order.id, e.target.value),
                    className: 'w-full px-4 py-2 rounded border'
                  },
                    React.createElement('option', { value: 'Pendente' }, '🟡 Pendente'),
                    React.createElement('option', { value: 'Em preparo' }, '🔵 Em Preparo'),
                    React.createElement('option', { value: 'Feito' }, '🟢 Feito')
                  )
                ),
                React.createElement('span', {
                  className: `ml-4 px-6 py-3 rounded-full font-bold ${
                    order.status === 'Pendente' ? 'bg-yellow-100' :
                    order.status === 'Em preparo' ? 'bg-blue-100' : 'bg-green-100'
                  }`
                }, order.status)
              )
            )
          )
        )
      )
    );
  }
}

export default AdminDashboard;
