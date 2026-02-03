import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Edit,
  Trash2,
  LogOut,
  X,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ delivery_fee: 5.0, pix_key: '' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Bolos Redondos',
    subcategory: '',
    size: '',
    servings: '',
    image_url: '',
    featured: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    };
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, getAuthHeader());
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logout realizado com sucesso!');
    navigate('/admin');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...productForm,
        price: parseFloat(productForm.price),
      };

      if (editingProduct) {
        await axios.put(
          `${API}/products/${editingProduct.id}`,
          formattedData,
          getAuthHeader()
        );
        toast.success('Produto atualizado com sucesso!');
      } else {
        await axios.post(`${API}/products`, formattedData, getAuthHeader());
        toast.success('Produto criado com sucesso!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeader());
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      size: product.size || '',
      servings: product.servings || '',
      image_url: product.image_url,
      featured: product.featured,
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'Bolos Redondos',
      subcategory: '',
      size: '',
      servings: '',
      image_url: '',
      featured: false,
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        getAuthHeader()
      );
      toast.success('Status atualizado!');
      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/settings`, settings, getAuthHeader());
      toast.success('Configurações atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="bg-brand-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl font-bold" data-testid="admin-dashboard-heading">
              Painel Administrativo
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-brand-brown text-white'
                : 'bg-white text-brand-brown hover:bg-brand-pink/30'
            }`}
            data-testid="tab-products"
          >
            <Package size={20} />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-brand-brown text-white'
                : 'bg-white text-brand-brown hover:bg-brand-pink/30'
            }`}
            data-testid="tab-orders"
          >
            <ShoppingCart size={20} />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-brand-brown text-white'
                : 'bg-white text-brand-brown hover:bg-brand-pink/30'
            }`}
            data-testid="tab-settings"
          >
            <Settings size={20} />
            Configurações
          </button>
        </div>

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-3xl font-bold text-brand-brown">
                Gestão de Produtos
              </h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 bg-brand-brown text-white px-6 py-3 rounded-full hover:bg-brand-brown/90 transition-all transform active:scale-95"
                data-testid="add-product-button"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-brand-pink/20"
                  data-testid={`product-card-${index}`}
                >
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-heading text-xl font-bold text-brand-brown mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-brand-brown/60 mb-2">
                      {product.category}
                    </p>
                    <p className="font-bold text-xl text-brand-rose mb-4">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-pink text-brand-brown px-4 py-2 rounded-full hover:bg-brand-pink/80 transition-all"
                        data-testid={`edit-product-${index}`}
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all"
                        data-testid={`delete-product-${index}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
              Gestão de Pedidos
            </h2>

            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-md border border-brand-pink/20"
                  data-testid={`order-card-${index}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-brand-brown text-lg">
                        {order.customer_name}
                      </h3>
                      <p className="text-sm text-brand-brown/70">
                        {order.customer_phone}
                      </p>
                      <p className="text-sm text-brand-brown/70">
                        {order.customer_address}
                      </p>
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

                  <div className="mb-4">
                    <p className="font-semibold text-brand-brown mb-2">Itens:</p>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-brand-brown/70">
                        {item.quantity}x {item.name} - R$ {item.price.toFixed(2)}
                      </p>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-brand-brown/70">
                      <span className="font-semibold">Pagamento:</span>{' '}
                      {order.payment_method === 'pix' && 'PIX'}
                      {order.payment_method === 'cartao' && 'Cartão (Maquininha)'}
                      {order.payment_method === 'dinheiro' &&
                        `Dinheiro${order.payment_details?.change_for ? ` - Troco: ${order.payment_details.change_for}` : ''}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value)
                      }
                      className="flex-1 px-4 py-2 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                      data-testid={`order-status-${index}`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em preparo">Em preparo</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-20" data-testid="no-orders-message">
                  <p className="text-xl text-brand-brown/60">
                    Nenhum pedido registrado ainda.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-6">
              Configurações
            </h2>

            <form
              onSubmit={handleUpdateSettings}
              className="bg-white rounded-2xl p-8 shadow-md border border-brand-pink/20 max-w-2xl"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Taxa de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.delivery_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        delivery_fee: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                    data-testid="delivery-fee-input"
                  />
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={settings.pix_key}
                    onChange={(e) =>
                      setSettings({ ...settings, pix_key: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                    placeholder="exemplo@email.com"
                    data-testid="pix-key-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-brown text-white py-4 rounded-full text-lg font-semibold hover:bg-brand-brown/90 shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                  data-testid="save-settings-button"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              data-testid="product-modal"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-brand-brown">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-brand-brown hover:text-brand-rose transition-colors"
                  data-testid="close-modal-button"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                    required
                    data-testid="product-name-input"
                  />
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none h-24"
                    data-testid="product-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-brown font-semibold mb-2">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                      required
                      data-testid="product-price-input"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown font-semibold mb-2">
                      Categoria *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({ ...productForm, category: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                      required
                      data-testid="product-category-select"
                    >
                      <option value="Bolos Redondos">Bolos Redondos</option>
                      <option value="Bolos Retangulares">Bolos Retangulares</option>
                      <option value="Doces">Doces</option>
                      <option value="Kits">Kits</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-brown font-semibold mb-2">
                      Subcategoria
                    </label>
                    <input
                      type="text"
                      value={productForm.subcategory}
                      onChange={(e) =>
                        setProductForm({ ...productForm, subcategory: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                      placeholder="Ex: Comuns, Finos"
                      data-testid="product-subcategory-input"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown font-semibold mb-2">
                      Tamanho
                    </label>
                    <input
                      type="text"
                      value={productForm.size}
                      onChange={(e) =>
                        setProductForm({ ...productForm, size: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                      placeholder="Ex: 10cm, 30x20cm"
                      data-testid="product-size-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Rendimento
                  </label>
                  <input
                    type="text"
                    value={productForm.servings}
                    onChange={(e) =>
                      setProductForm({ ...productForm, servings: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                    placeholder="Ex: 25 fatias"
                    data-testid="product-servings-input"
                  />
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm({ ...productForm, image_url: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                    placeholder="https://exemplo.com/imagem.jpg"
                    data-testid="product-image-url-input"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, featured: e.target.checked })
                    }
                    className="w-5 h-5 accent-brand-brown"
                    data-testid="product-featured-checkbox"
                  />
                  <label className="text-brand-brown font-semibold">
                    Produto em Destaque
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 bg-brand-pink text-brand-brown py-3 rounded-full font-semibold hover:bg-brand-pink/80 transition-all"
                    data-testid="cancel-product-button"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-brown text-white py-3 rounded-full font-semibold hover:bg-brand-brown/90 transition-all"
                    data-testid="save-product-button"
                  >
                    {editingProduct ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
