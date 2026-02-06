import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [view, setView] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Produto
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Bolos Redondos', image_url: ''
  });

  // Configurações
  const [settings, setSettings] = useState({
    delivery_fee: 5.0,
    pix_key: '',
    contact_phone: '',
    massas_options: [], 
    recheios_options: [] 
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
        axios.get(`${API}/settings`)
      ]);
      setOrders(resOrders.data);
      setProducts(resProducts.data);
      setSettings(resSettings.data || {});

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

  // --- FUNÇÃO DE IMPRESSÃO (NOVA) ---
  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    
    const itemsHtml = order.items.map(item => `
      <div class="item">
        <div class="item-header">
          <span class="qty">${item.quantity}x</span>
          <span class="name">${item.name}</span>
        </div>
        ${item.customization ? `
          <div class="customization">
            ${item.customization.massa ? `<div>Massa: <strong>${item.customization.massa}</strong></div>` : ''}
            ${item.customization.recheio ? `<div>Recheio: <strong>${item.customization.recheio}</strong></div>` : ''}
            ${item.customization.cobertura ? `<div>Cob: ${item.customization.cobertura}</div>` : ''}
            ${item.customization.observacoes ? `<div class="obs">⚠️ ${item.customization.observacoes}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Pedido #${order.id.slice(0,6)}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .brand { font-size: 1.2em; font-weight: bold; text-transform: uppercase; }
            .meta { font-size: 0.9em; margin-top: 5px; }
            .customer { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; font-size: 0.95em; }
            .label { font-weight: bold; }
            .item { margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
            .item-header { font-size: 1.1em; font-weight: bold; }
            .customization { font-size: 0.85em; margin-left: 10px; margin-top: 2px; line-height: 1.4; }
            .obs { font-weight: bold; margin-top: 2px; text-decoration: underline; }
            .totals { margin-top: 20px; border-top: 2px dashed #000; pt: 10px; text-align: right; font-size: 1.1em; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">RENAILDES CAKES</div>
            <div class="meta">Pedido #${order.id.slice(0,6).toUpperCase()}</div>
            <div class="meta">${new Date(order.created_at).toLocaleDateString('pt-BR')} - ${new Date(order.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
          </div>

          <div class="customer">
            <div><span class="label">Cliente:</span> ${order.customer_name}</div>
            <div><span class="label">Tel:</span> ${order.customer_phone}</div>
            ${order.customer_address ? `<div><span class="label">End:</span> ${order.customer_address}</div>` : ''}
            <div><span class="label">Pagto:</span> ${order.payment_method}</div>
          </div>

          <div class="items">
            ${itemsHtml}
          </div>

          <div class="totals">
            ${order.delivery_fee > 0 ? `<div>Taxa: R$ ${order.delivery_fee.toFixed(2)}</div>` : ''}
            <div><strong>TOTAL: R$ ${order.total.toFixed(2)}</strong></div>
          </div>

          <div class="footer">
            --- Fim do Pedido ---
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // --- ACTIONS PEDIDOS E PRODUTOS ---
  const handleStatusChange = async (id, status) => {
    await axios.patch(`${API}/orders/${id}/status?status=${status}`, {}, getHeaders());
    loadData();
  };
  const handleDeleteOrder = async (id) => {
    if(!window.confirm("Apagar pedido?")) return;
    await axios.delete(`${API}/orders/${id}`, getHeaders());
    loadData();
  };
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description, price: product.price,
      category: product.category || 'Bolos Redondos', image_url: product.image_url
    });
    setView('form');
  };
  const handleNewClick = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: 'Bolos Redondos', image_url: '' });
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
    } catch (error) { alert("Erro ao salvar produto."); }
  };

  // --- ACTIONS CONFIGURAÇÕES ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...settings, 
        delivery_fee: parseFloat(settings.delivery_fee)
      };
      await axios.put(`${API}/settings`, payload, getHeaders());
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl text-pink-900">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-pink-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold font-serif">🍰 Renaildes Admin</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-1.5 rounded text-sm font-bold">Sair</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* MENU */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
          <button onClick={() => setView('orders')} className={`px-5 py-2.5 rounded-lg font-bold ${view === 'orders' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>📋 Pedidos ({orders.length})</button>
          <button onClick={() => { setView('products'); loadData(); }} className={`px-5 py-2.5 rounded-lg font-bold ${view === 'products' || view === 'form' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>🧁 Cardápio</button>
          <button onClick={() => setView('settings')} className={`px-5 py-2.5 rounded-lg font-bold ${view === 'settings' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>⚙️ Configurações</button>
        </div>

        {/* --- PEDIDOS --- */}
        {view === 'orders' && (
          <div className="grid gap-4">
            {orders.length === 0 && <p className="text-center py-10 text-gray-400">Sem pedidos.</p>}
            {orders.map(order => (
              <div key={order.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-8 ${order.status === 'Pendente' ? 'border-yellow-400' : order.status === 'Feito' ? 'border-green-500' : 'border-blue-400'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-xl">{order.customer_name}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mb-2">{order.customer_address} • {order.customer_phone}</p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="mb-1">
                            <span className="font-bold">{item.quantity}x {item.name}</span>
                            {item.customization && <span className="text-gray-500 text-xs block ml-4">M: {item.customization.massa} | R: {item.customization.recheio}</span>}
                         </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-pink-700">R$ {order.total.toFixed(2)}</p>
                    
                    {/* BOTÕES DE AÇÃO */}
                    <div className="mt-4 flex gap-2 justify-end items-center flex-wrap">
                      
                      {/* BOTÃO DE IMPRIMIR (NOVO) */}
                      <button 
                        onClick={() => handlePrintOrder(order)} 
                        className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-black transition-colors flex items-center gap-1"
                        title="Imprimir Comanda"
                      >
                        🖨️ <span className="text-xs font-bold hidden md:inline">Imprimir</span>
                      </button>

                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border rounded p-2 text-sm font-bold bg-gray-50 cursor-pointer outline-none">
                        <option>Pendente</option><option>Em preparo</option><option>Feito</option>
                      </select>
                      
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-red-400 p-2 border rounded hover:bg-red-50" title="Excluir">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PRODUTOS --- */}
        {view === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cardápio Atual</h2>
              <button onClick={handleNewClick} className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold">+ Novo Produto</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden">
                  <div className="h-48 bg-gray-100"><img src={prod.image_url} alt="" className="w-full h-full object-cover" /></div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between font-bold mb-2"><h3>{prod.name}</h3><span className="text-pink-600">R$ {prod.price.toFixed(2)}</span></div>
                    <p className="text-sm text-gray-500">{prod.category}</p>
                  </div>
                  <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => handleEditClick(prod)} className="text-blue-600 font-bold text-sm px-3">Editar</button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-600 font-bold text-sm px-3">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FORMULÁRIO PRODUTO --- */}
        {view === 'form' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input type="text" placeholder="Nome" required className="w-full p-3 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Preço" required className="w-full p-3 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <select className="w-full p-3 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Bolos Redondos</option><option>Bolos Retangulares</option><option>Doces</option><option>Kits</option>
                </select>
              </div>
              <input type="text" placeholder="URL da Imagem" className="w-full p-3 border rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <textarea placeholder="Descrição" className="w-full p-3 border rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setView('products')} className="px-6 py-2 border rounded">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold">Salvar</button>
              </div>
            </form>
          </div>
        )}

        {/* --- CONFIGURAÇÕES --- */}
        {view === 'settings' && (
          <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">⚙️ Configurações Gerais</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">💰 Taxas e Contato</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Taxa Entrega (R$)</label>
                    <input type="number" step="0.01" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={settings.delivery_fee} onChange={e => setSettings({...settings, delivery_fee: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chave Pix</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={settings.pix_key} onChange={e => setSettings({...settings, pix_key: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp de Contato</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={settings.contact_phone} onChange={e => setSettings({...settings, contact_phone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button type="submit" className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-md text-lg">💾 Salvar Configurações</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
