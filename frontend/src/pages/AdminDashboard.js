import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [view, setView] = useState('orders'); // 'orders', 'products', 'form', 'settings'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de Edição de Produto
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Bolos Redondos', // Valor padrão atualizado
    image_url: ''
  });

  // Estado de Configurações
  const [settings, setSettings] = useState({
    delivery_fee: 5.0,
    pix_key: '',
    available_massas: '',
    available_recheios: '',
    contact_phone: ''
  });

  // Autenticação e Carregamento Inicial
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
      // Carrega tudo de uma vez
      const [resOrders, resProducts, resSettings] = await Promise.all([
        axios.get(`${API}/orders`, getHeaders()),
        axios.get(`${API}/products`),
        axios.get(`${API}/settings`)
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

  // --- LÓGICA DE PEDIDOS ---
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`${API}/orders/${id}/status?status=${status}`, {}, getHeaders());
      loadData(); // Recarrega para confirmar
    } catch (err) {
      alert("Erro ao atualizar status");
    }
  };

  const handleDeleteOrder = async (id) => {
    if(!window.confirm("Tem certeza que deseja apagar este pedido do histórico?")) return;
    try {
      await axios.delete(`${API}/orders/${id}`, getHeaders());
      loadData();
    } catch (err) {
      alert("Erro ao deletar pedido");
    }
  };

  // --- LÓGICA DE PRODUTOS ---
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || 'Bolos Redondos',
      image_url: product.image_url
    });
    setView('form');
  };

  const handleNewClick = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: 'Bolos Redondos', 
      image_url: '' 
    });
    setView('form');
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Tem certeza que quer apagar este produto do cardápio?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, getHeaders());
      alert("Produto deletado!");
      loadData();
    } catch (err) {
      alert("Erro ao deletar produto.");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        // Editar
        await axios.put(`${API}/products/${editingProduct.id}`, payload, getHeaders());
        alert("Produto Atualizado com Sucesso!");
      } else {
        // Criar Novo
        await axios.post(`${API}/products`, payload, getHeaders());
        alert("Produto Criado com Sucesso!");
      }
      loadData();
      setView('products');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se o preço é um número válido (use ponto em vez de vírgula).");
    }
  };

  // --- LÓGICA DE CONFIGURAÇÕES ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...settings, delivery_fee: parseFloat(settings.delivery_fee) };
      await axios.put(`${API}/settings`, payload, getHeaders());
      alert("Configurações salvas! O site já está atualizado.");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-900 font-bold text-xl">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <nav className="bg-pink-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold font-serif">🍰 Renaildes Admin</h1>
          <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 px-4 py-1.5 rounded text-sm font-bold transition-colors">
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Menu de Abas */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setView('orders')} 
            className={`px-5 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all ${view === 'orders' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            📋 Pedidos ({orders.length})
          </button>
          <button 
            onClick={() => { setView('products'); loadData(); }} 
            className={`px-5 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all ${view === 'products' || view === 'form' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            🧁 Gerenciar Cardápio
          </button>
          <button 
            onClick={() => setView('settings')} 
            className={`px-5 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all ${view === 'settings' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            ⚙️ Configurações
          </button>
        </div>

        {/* --- TELA DE PEDIDOS --- */}
        {view === 'orders' && (
          <div className="grid gap-4">
            {orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-400 text-lg">Nenhum pedido recebido ainda.</p>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-8 transition-all hover:shadow-md ${
                order.status === 'Pendente' ? 'border-yellow-400' : 
                order.status === 'Feito' ? 'border-green-500' : 'border-blue-400'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-gray-800">{order.customer_name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">📍 {order.customer_address} • 📞 {order.customer_phone}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-0 border-gray-200">
                          <p className="font-bold text-gray-700">
                            {item.quantity}x {item.name}
                          </p>
                          {item.customization && (
                            <div className="ml-4 mt-1 text-xs text-gray-500 space-y-0.5">
                              {item.customization.massa && <p>• Massa: {item.customization.massa}</p>}
                              {item.customization.recheio && <p>• Recheio: {item.customization.recheio}</p>}
                              {item.customization.cobertura && <p>• Cobertura: {item.customization.cobertura}</p>}
                              {item.customization.observacoes && <p className="text-blue-600 font-semibold">• Obs: {item.customization.observacoes}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between text-xs font-bold text-gray-500">
                        <span>Pagamento: {order.payment_method}</span>
                        {order.delivery_fee > 0 && <span>Taxa Entrega: R$ {order.delivery_fee.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right w-full md:w-auto flex flex-col justify-between h-full min-h-[120px]">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total do Pedido</p>
                      <p className="text-3xl font-bold text-pink-700">R$ {order.total.toFixed(2)}</p>
                    </div>
                    
                    <div className="mt-4 flex gap-2 justify-end items-center">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`border rounded-lg p-2 text-sm font-bold outline-none cursor-pointer ${
                          order.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          order.status === 'Feito' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="Pendente">🟡 Pendente</option>
                        <option value="Em preparo">🔵 Em Preparo</option>
                        <option value="Feito">🟢 Feito / Entregue</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)} 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Apagar pedido"
                      >
                        🗑️
                      </button>
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
              <h2 className="text-xl font-bold text-gray-800">Seu Cardápio Atual</h2>
              <button 
                onClick={handleNewClick} 
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-md transition-all flex items-center gap-2"
              >
                + Novo Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                  <div className="h-48 bg-gray-100 relative">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {prod.category}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{prod.name}</h3>
                      <span className="text-pink-600 font-bold whitespace-nowrap ml-2">R$ {prod.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-3">{prod.description || "Sem descrição definida."}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-100">
                    <button onClick={() => handleEditClick(prod)} className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TELA DE FORMULÁRIO (CRIAR/EDITAR) --- */}
        {view === 'form' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
              {editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Item'}
            </h2>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Bolo 15cm"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preço Base (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {/* ATUALIZADO PARA AS NOVAS CATEGORIAS */}
                    <option>Bolos Redondos</option>
                    <option>Bolos Retangulares</option>
                    <option>Doces</option>
                    <option>Kits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link da Imagem (URL)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">Dica: Copie o endereço da imagem do Google Imagens ou Instagram.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição (Aparece no card)</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none h-32 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva quantas fatias serve, detalhes..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button type="button" onClick={() => setView('products')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md">
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TELA DE CONFIGURAÇÕES --- */}
        {view === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">⚙️ Configurações Gerais</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">💰 Taxas e Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Taxa de Entrega (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                      value={settings.delivery_fee} 
                      onChange={e => setSettings({...settings, delivery_fee: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chave PIX</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                      value={settings.pix_key} 
                      onChange={e => setSettings({...settings, pix_key: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">🎂 Personalização Automática</h3>
                <p className="text-sm text-yellow-700 mb-4 bg-white/50 p-3 rounded border border-yellow-200">
                  ⚠️ <strong>Atenção:</strong> Os preços e lista de sabores agora são fixos no código para garantir que o cálculo "Premium" (ex: +R$32) funcione. 
                  <br/><br/>
                  Esses campos abaixo servem apenas como referência visual se precisar mudar nomes simples no futuro.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Massas (Separe por vírgula)</label>
                  <textarea 
                    className="w-full p-3 border border-yellow-200 rounded-lg h-24 focus:ring-2 focus:ring-yellow-400 outline-none" 
                    value={settings.available_massas} 
                    onChange={e => setSettings({...settings, available_massas: e.target.value})} 
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Recheios (Separe por vírgula)</label>
                  <textarea 
                    className="w-full p-3 border border-yellow-200 rounded-lg h-24 focus:ring-2 focus:ring-yellow-400 outline-none" 
                    value={settings.available_recheios} 
                    onChange={e => setSettings({...settings, available_recheios: e.target.value})} 
                  ></textarea>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Telefone de Contato (WhatsApp)</label>
                 <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" 
                    value={settings.contact_phone} 
                    onChange={e => setSettings({...settings, contact_phone: e.target.value})} 
                 />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-md transition-all transform hover:scale-[1.01]">
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
