import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [deliveryFee, setDeliveryFee] = useState(5.0);
  const [pixKey, setPixKey] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [changeFor, setChangeFor] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setDeliveryFee(response.data.delivery_fee);
      setPixKey(response.data.pix_key);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.finalPrice || item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_phone || !formData.customer_address) {
      toast.error('Por favor, preencha todos os campos!');
      return;
    }

    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    const orderData = {
      ...formData,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.finalPrice || item.price,
        quantity: item.quantity,
        customization: item.customization || null
      })),
      subtotal: calculateTotal(),
      delivery_fee: deliveryFee,
      total: calculateTotal() + deliveryFee,
      payment_method: paymentMethod,
      payment_details:
        paymentMethod === 'dinheiro' ? { change_for: changeFor } : null,
    };

    try {
      const response = await axios.post(`${API}/orders`, orderData);
      toast.success('Pedido realizado com sucesso!');
      
      // Gerar mensagem WhatsApp
      const whatsappMsg = generateWhatsAppMessage(response.data);
      const whatsappUrl = `https://wa.me/5575981777873?text=${encodeURIComponent(whatsappMsg)}`;
      
      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank');
      
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    }
  };

  const generateWhatsAppMessage = (order) => {
    let msg = `🎂 *Olá! Gostaria de fazer um pedido:*\n\n`;
    msg += `👤 *Nome:* ${formData.customer_name}\n`;
    msg += `📱 *Telefone:* ${formData.customer_phone}\n`;
    msg += `📍 *Endereço:* ${formData.customer_address}\n\n`;
    
    msg += `🛒 *Itens:*\n`;
    cart.forEach((item) => {
      const price = item.finalPrice || item.price;
      msg += `• ${item.quantity}x ${item.name} - R$ ${price.toFixed(2)}\n`;
      
      if (item.customization) {
        msg += `  └ 🎂 Massa: ${item.customization.massa}\n`;
        msg += `  └ 🍰 Recheio: ${item.customization.recheio}\n`;
        msg += `  └ ✨ Cobertura: ${item.customization.cobertura}\n`;
        if (item.customization.observacoes) {
          msg += `  └ 📝 ${item.customization.observacoes}\n`;
        }
      }
      msg += `\n`;
    });
    
    msg += `💰 *Subtotal:* R$ ${calculateTotal().toFixed(2)}\n`;
    msg += `🚚 *Entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    msg += `💵 *TOTAL:* R$ ${(calculateTotal() + deliveryFee).toFixed(2)}\n\n`;
    
    msg += `💳 *Forma de Pagamento:* `;
    if (paymentMethod === 'pix') msg += 'PIX';
    else if (paymentMethod === 'cartao') msg += 'Cartão (maquininha na entrega)';
    else if (paymentMethod === 'dinheiro') {
      msg += 'Dinheiro';
      if (changeFor) msg += ` - Troco para: ${changeFor}`;
    }
    
    return msg;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center" data-testid="empty-cart-message">
            <h2 className="font-heading text-3xl font-bold text-brand-brown mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-brand-brown/70 mb-8">
              Adicione produtos ao carrinho para continuar.
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-brand-brown text-white px-8 py-3 rounded-full hover:bg-brand-brown/90 transition-all"
              data-testid="browse-catalog-button"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-heading text-4xl md:text-5xl font-bold text-brand-brown mb-12"
          data-testid="checkout-heading"
        >
          Finalizar Pedido
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-brand-pink/20 mb-8"
            >
              <h2 className="font-heading text-2xl font-bold text-brand-brown mb-6">
                Seus Produtos
              </h2>
              <div className="space-y-4">
                {cart.map((item, index) => {
                  const itemId = item.cartItemId || item.id;
                  return (
                  <div
                    key={itemId}
                    className="pb-4 border-b border-brand-pink/20 last:border-0"
                    data-testid={`cart-item-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-brown">{item.name}</h3>
                        {item.customization && (
                          <div className="mt-2 text-sm text-brand-brown/70 bg-brand-pink/20 p-2 rounded">
                            <p><strong>Massa:</strong> {item.customization.massa}</p>
                            <p><strong>Recheio:</strong> {item.customization.recheio}</p>
                            <p><strong>Cobertura:</strong> {item.customization.cobertura}</p>
                            {item.customization.observacoes && (
                              <p><strong>Obs:</strong> {item.customization.observacoes}</p>
                            )}
                          </div>
                        )}
                        <p className="text-brand-rose font-bold mt-2">
                          R$ {(item.finalPrice || item.price).toFixed(2)}
                          {item.customization?.precoAdicional > 0 && (
                            <span className="text-xs text-brand-brown/60"> (personalizado)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(itemId, item.quantity - 1)}
                          className="w-8 h-8 bg-brand-pink rounded-full font-bold hover:bg-brand-pink/80"
                          data-testid={`decrease-quantity-${index}`}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold" data-testid={`item-quantity-${index}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          className="w-8 h-8 bg-brand-pink rounded-full font-bold hover:bg-brand-pink/80"
                          data-testid={`increase-quantity-${index}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </motion.div>

            <motion.form
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 shadow-md border border-brand-pink/20"
            >
              <h2 className="font-heading text-2xl font-bold text-brand-brown mb-6">
                Dados de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors"
                    placeholder="Seu nome"
                    required
                    data-testid="customer-name-input"
                  />
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors"
                    placeholder="(75) 98177-7873"
                    required
                    data-testid="customer-phone-input"
                  />
                </div>

                <div>
                  <label className="block text-brand-brown font-semibold mb-2">
                    Endereço Completo *
                  </label>
                  <textarea
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors h-24"
                    placeholder="Rua, número, bairro, cidade"
                    required
                    data-testid="customer-address-input"
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-heading text-xl font-bold text-brand-brown mb-4">
                  Forma de Pagamento
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg border border-brand-pink/50 cursor-pointer hover:bg-brand-pink/20 transition-colors" data-testid="payment-pix">
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-brand-brown"
                    />
                    <Smartphone className="text-brand-brown" size={24} />
                    <span className="font-semibold text-brand-brown">PIX</span>
                  </label>

                  {paymentMethod === 'pix' && (
                    <div className="ml-12 p-4 bg-brand-pink/20 rounded-lg" data-testid="pix-details">
                      <p className="text-sm text-brand-brown mb-2">
                        <span className="font-semibold">Chave PIX:</span> {pixKey}
                      </p>
                      <p className="text-xs text-brand-brown/70">
                        Após realizar o pedido, faça o pagamento via PIX e envie o comprovante pelo WhatsApp.
                      </p>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-4 rounded-lg border border-brand-pink/50 cursor-pointer hover:bg-brand-pink/20 transition-colors" data-testid="payment-cartao">
                    <input
                      type="radio"
                      name="payment"
                      value="cartao"
                      checked={paymentMethod === 'cartao'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-brand-brown"
                    />
                    <CreditCard className="text-brand-brown" size={24} />
                    <span className="font-semibold text-brand-brown">
                      Cartão (Maquininha na entrega)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border border-brand-pink/50 cursor-pointer hover:bg-brand-pink/20 transition-colors" data-testid="payment-dinheiro">
                    <input
                      type="radio"
                      name="payment"
                      value="dinheiro"
                      checked={paymentMethod === 'dinheiro'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-brand-brown"
                    />
                    <Banknote className="text-brand-brown" size={24} />
                    <span className="font-semibold text-brand-brown">
                      Dinheiro (Na entrega)
                    </span>
                  </label>

                  {paymentMethod === 'dinheiro' && (
                    <div className="ml-12">
                      <label className="block text-brand-brown font-semibold mb-2">
                        Troco para quanto?
                      </label>
                      <input
                        type="text"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none"
                        placeholder="R$ 100,00"
                        data-testid="change-for-input"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-8 bg-brand-brown text-white py-4 rounded-full text-lg font-semibold hover:bg-brand-brown/90 shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                data-testid="submit-order-button"
              >
                Finalizar Pedido
              </button>
            </motion.form>
          </div>

          <div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-brand-pink/20 sticky top-24"
            >
              <h2 className="font-heading text-2xl font-bold text-brand-brown mb-6">
                Resumo do Pedido
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-brand-brown">
                  <span>Subtotal</span>
                  <span className="font-semibold" data-testid="subtotal-display">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-brand-brown">
                  <span>Taxa de Entrega</span>
                  <span className="font-semibold" data-testid="delivery-fee-display">
                    R$ {deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-brand-pink/20 pt-4 flex justify-between text-brand-brown">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-brand-rose" data-testid="total-display">
                    R$ {(calculateTotal() + deliveryFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
