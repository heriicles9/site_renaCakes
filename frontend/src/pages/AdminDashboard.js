import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [view, setView] = useState('orders'); // 'orders', 'products', 'form'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado do Formulário de Produto
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Bolos',
    image_url: ''
  });

  // Autenticação
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin';
    } else {
      loadData();
    }
  }, []);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts] = await Promise.all([
        axios.get(`${API}/orders`, getHeaders()),
        axios.get(`${API}/products`)
      ]);
      setOrders(resOrders.data);
      setProducts(resProducts.data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
      if(error.response && error.response.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  };

  // --- LÓGICA DE PEDIDOS ---
  const handleStatusChange = async (id, status) => {
    await axios.patch(`${API}/orders/${id}/status?status=${status}`, {}, getHeaders());
    loadData();
  };

  const handleDeleteOrder = async (id) => {
    if(!window.confirm("Apagar pedido?")) return;
    await axios.delete(`${API}/orders/${id}`, getHeaders());
    loadData();
  };

  // --- LÓGICA DE PRODUTOS ---
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url
    });
    setView('form');
  };

  const handleNewClick = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: 'Bolos', image_url: '' });
    setView('form');
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Tem certeza que quer apagar este produto?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, getHeaders());
      alert("Produto deletado!");
      loadData();
    } catch (err) {
      alert("Erro ao deletar.");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) // Garante que é número
      };

      if (editingProduct) {
        // Editar
        await axios.put(`${API}/products/${editingProduct.id}`, payload, getHeaders());
        alert("Produto Atualizado!");
      } else {
        // Criar
        await axios.post(`${API}/products`, payload, getHeaders());
        alert("Produto Criado!");
      }
      loadData();
      setView('products');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto. Verifique os dados.");
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <nav className="bg-pink-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍰 Renaildes Admin</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Sair</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Menu de Abas */}
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button 
            onClick={() => setView('orders')} 
            className={`px-6 py-2 rounded-lg font-bold ${view === 'orders' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            📋 Pedidos ({orders.length})
          </button>
          <button 
            onClick={() => { setView('products'); loadData(); }} 
            className={`px-6 py-2 rounded-lg font-bold ${view === 'products' || view === 'form' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            🧁 Gerenciar Cardápio
          </button>
        </div>

        {/* --- TELA DE PEDIDOS --- */}
        {view === 'orders' && (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.id} className={`bg-white p-6 rounded-lg shadow border-l-8 ${
                order.status === 'Pendente' ? 'border-yellow-400' : 
                order.status === 'Feito' ? 'border-green-500' : 'border-blue-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl">{order.customer_name}</h3>
                    <p className="text-gray-600">{order.customer_address} • {order.customer_phone}</p>
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      {order.items.map((item, idx) => (
                        <p key={idx}>• {item.quantity}x {item.name} {item.customization ? `- ${JSON.stringify(item.customization)}` : ''}</p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pink-700">R$ {order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    <div className="mt-2 flex gap-2 justify-end">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option>Pendente</option>
                        <option>Em preparo</option>
                        <option>Feito</option>
                      </select>
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-red-500 hover:bg-red-100 p-2 rounded">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TELA DE LISTA DE PRODUTOS --- */}
        {view === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Seu Cardápio Atual</h2>
              <button onClick={handleNewClick} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                + Novo Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-200">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{prod.name}</h3>
                      <span className="text-pink-600 font-bold">R$ {prod.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{prod.category}</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{prod.description || "Sem descrição"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t">
                    <button onClick={() => handleEditClick(prod)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">Editar</button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TELA DE FORMULÁRIO (CRIAR/EDITAR) --- */}
        {view === 'form' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Bolo'}
            </h2>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Bolo de Chocolate Supremo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full p-2 border rounded"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Categoria</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Bolos</option>
                    <option>Doces</option>
                    <option>Salgados</option>
                    <option>Bebidas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Link da Imagem (URL)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">Dica: Pegue uma foto do Google ou Instagram, clique com botão direito e 'Copiar endereço da imagem'.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Descrição (Sabores, Massas, Recheios)</label>
                <textarea 
                  className="w-full p-2 border rounded h-32"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva aqui os recheios disponíveis, tipos de massa..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setView('products')} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
