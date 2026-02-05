import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [view, setView] = useState('orders'); // 'orders', 'products', 'form', 'settings'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de Produtos
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Bolos',
    image_url: ''
  });

  // Estado de Configurações (Taxas, Massas, Recheios)
  const [settings, setSettings] = useState({
    delivery_fee: 5.0,
    pix_key: '',
    available_massas: '',
    available_recheios: '',
    contact_phone: ''
  });

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
      const [resOrders, resProducts, resSettings] = await Promise.all([
        axios.get(`${API}/orders`, getHeaders()),
        axios.get(`${API}/products`),
        axios.get(`${API}/settings`) // Carrega as configurações
      ]);
      setOrders(resOrders.data);
      setProducts(resProducts.data);
      setSettings(resSettings.data);
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

  // --- ACTIONS PEDIDOS ---
  const handleStatusChange = async (id, status) => {
    await axios.patch(`${API}/orders/${id}/status?status=${status}`, {}, getHeaders());
    loadData();
  };

  const handleDeleteOrder = async (id) => {
    if(!window.confirm("Apagar pedido?")) return;
    await axios.delete(`${API}/orders/${id}`, getHeaders());
    loadData();
  };

  // --- ACTIONS PRODUTOS ---
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
    if(!window.confirm("Apagar produto?")) return;
    await axios.delete(`${API}/products/${id}`, getHeaders());
    loadData();
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, payload, getHeaders());
        alert("Produto Atualizado!");
      } else {
        await axios.post(`${API}/products`, payload, getHeaders());
        alert("Produto Criado!");
      }
      loadData();
      setView('products');
    } catch (error) {
      alert("Erro ao salvar produto.");
    }
  };

  // --- ACTIONS CONFIGURAÇÕES ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...settings, delivery_fee: parseFloat(settings.delivery_fee) };
      await axios.put(`${API}/settings`, payload, getHeaders());
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-pink-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">🍰 Renaildes Admin</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700 text-sm">Sair</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Menu de Abas */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b pb-4">
          <button onClick={() => setView('orders')} className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base ${view === 'orders' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            📋 Pedidos
          </button>
          <button onClick={() => { setView('products'); loadData(); }} className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base ${view === 'products' || view === 'form' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            🧁 Cardápio
          </button>
          <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base ${view === 'settings' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            ⚙️ Configurações
          </button>
        </div>

        {/* --- TELA DE PEDIDOS --- */}
        {view === 'orders' && (
          <div className="grid gap-4">
            {orders.length === 0 && <p className="text-gray-500 text-center py-10">Nenhum pedido recebido ainda.</p>}
            {orders.map(order => (
              <div key={order.id} className={`bg-white p-6 rounded-lg shadow border-l-8 ${order.status === 'Pendente' ? 'border-yellow-400' : order.status === 'Feito' ? 'border-green-500' : 'border-blue-400'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-xl">{order.customer_name}</h3>
                    <p className="text-gray-600 text-sm">{order.customer_address} • {order.customer_phone}</p>
                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                      {order.items.map((item, idx) => (
                        <p key={idx}>• {item.quantity}x {item.name}</p>
                      ))}
                      <p className="mt-2 text-xs text-gray-500 font-semibold">Taxa Entrega: R$ {order.delivery_fee ? order.delivery_fee.toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="text-2xl font-bold text-pink-700">R$ {order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    <div className="mt-2 flex gap-2 justify-end">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border rounded p-1 text-sm">
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

        {/* --- TELA DE PRODUTOS --- */}
        {view === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Seu Cardápio</h2>
              <button onClick={handleNewClick} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm">
                + Novo Produto
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                  <div className="h-40 bg-gray-200">
                    {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">Sem Foto</div>}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between"><h3 className="font-bold">{prod.name}</h3><span className="text-pink-600 font-bold">R$ {prod.price.toFixed(2)}</span></div>
                    <p className="text-xs text-gray-500 mt-1">{prod.category}</p>
                  </div>
                  <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t">
                    <button onClick={() => handleEditClick(prod)} className="text-blue-600 text-sm font-bold px-2">Editar</button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-600 text-sm font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TELA DE FORMULÁRIO --- */}
        {view === 'form' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-700">Nome</label><input type="text" required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700">Preço (R$)</label><input type="number" step="0.01" required className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-gray-700">Categoria</label><select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Bolos</option><option>Doces</option><option>Salgados</option></select></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700">Link da Imagem</label><input type="text" className="w-full p-2 border rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-gray-700">Descrição</label><textarea className="w-full p-2 border rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setView('products')} className="px-4 py-2 border rounded text-gray-600">Cancelar</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold">Salvar</button></div>
            </form>
          </div>
        )}

        {/* --- TELA DE CONFIGURAÇÕES (NOVA) --- */}
        {view === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">⚙️ Configurações Gerais</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3">💰 Taxas e Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Taxa de Entrega (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full p-2 border rounded" 
                      value={settings.delivery_fee} 
                      onChange={e => setSettings({...settings, delivery_fee: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Chave PIX</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      value={settings.pix_key} 
                      onChange={e => setSettings({...settings, pix_key: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="font-bold text-yellow-800 mb-3">🎂 Personalização (Opções)</h3>
                <p className="text-xs text-gray-500 mb-2">Digite as opções separadas por vírgula. Ex: Chocolate, Baunilha.</p>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700">Massas Disponíveis</label>
                  <textarea 
                    className="w-full p-2 border rounded h-20" 
                    value={settings.available_massas} 
                    onChange={e => setSettings({...settings, available_massas: e.target.value})} 
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700">Recheios Disponíveis</label>
                  <textarea 
                    className="w-full p-2 border rounded h-20" 
                    value={settings.available_recheios} 
                    onChange={e => setSettings({...settings, available_recheios: e.target.value})} 
                  ></textarea>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700">Telefone de Contato (WhatsApp)</label>
                 <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={settings.contact_phone} 
                    onChange={e => setSettings({...settings, contact_phone: e.target.value})} 
                 />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 shadow-md">
                  Salvar Todas as Configurações
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
