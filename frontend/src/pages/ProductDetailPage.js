import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CakeCustomizer from '../components/CakeCustomizer';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Produto não encontrado');
      navigate('/catalogo');
    }
  };

  const isCakeProduct = product && (product.category === 'Bolos Redondos' || product.category === 'Bolos Retangulares');

  const handleAddToCart = () => {
    if (!product) return;

    if (isCakeProduct && (!customization || !customization.isComplete)) {
      toast.error('Por favor, personalize seu bolo antes de adicionar ao carrinho!');
      return;
    }

    const productWithCustomization = {
      ...product,
      customization: customization || null,
      finalPrice: product.price + (customization?.precoAdicional || 0)
    };

    addToCart(productWithCustomization, quantity);
    
    if (customization) {
      toast.success(
        `${quantity}x ${product.name} personalizado adicionado ao carrinho!\n` +
        `Massa: ${customization.massa}\n` +
        `Recheio: ${customization.recheio}`
      );
    } else {
      toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    }
  };

  const getTotalPrice = () => {
    const basePrice = product.price;
    const customPrice = customization?.precoAdicional || 0;
    return (basePrice + customPrice) * quantity;
  };

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-xl text-brand-brown/60">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-brown hover:text-brand-rose transition-colors mb-8 font-medium"
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-brand-pink/20">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85'}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-brown mb-4" data-testid="product-name">
              {product.name}
            </h1>

            <div className="mb-6">
              <span className="inline-block bg-brand-pink text-brand-brown px-4 py-2 rounded-full text-sm font-semibold">
                {product.category}
              </span>
              {product.subcategory && (
                <span className="inline-block bg-brand-pink/50 text-brand-brown px-4 py-2 rounded-full text-sm font-semibold ml-2">
                  {product.subcategory}
                </span>
              )}
            </div>

            {product.size && (
              <p className="text-lg text-brand-brown/80 mb-2">
                <span className="font-semibold">Tamanho:</span> {product.size}
              </p>
            )}

            {product.servings && (
              <p className="text-lg text-brand-brown/80 mb-6">
                <span className="font-semibold">Rende:</span> {product.servings}
              </p>
            )}

            <p className="text-lg text-brand-brown/70 leading-relaxed mb-8" data-testid="product-description">
              {product.description}
            </p>

            <div className="bg-brand-pink/30 p-6 rounded-2xl mb-8">
              <p className="text-sm text-brand-brown/70 mb-2">Preço Base</p>
              <p className="font-bold text-4xl text-brand-rose" data-testid="product-price">
                R$ {product.price.toFixed(2)}
              </p>
              {customization && customization.precoAdicional > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-brown/20">
                  <p className="text-sm text-brand-brown/70">Personalização</p>
                  <p className="font-bold text-2xl text-brand-brown">
                    +R$ {customization.precoAdicional.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-brand-brown font-semibold mb-3">
                Quantidade:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-brand-pink text-brand-brown rounded-full font-bold hover:bg-brand-pink/80 transition-all transform active:scale-95"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-brand-brown w-16 text-center" data-testid="quantity-display">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-brand-pink text-brand-brown rounded-full font-bold hover:bg-brand-pink/80 transition-all transform active:scale-95"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isCakeProduct && (!customization || !customization.isComplete)}
              className="w-full bg-brand-brown text-white py-4 rounded-full text-lg font-semibold hover:bg-brand-brown/90 shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="add-to-cart-button"
            >
              <ShoppingBag size={24} />
              {isCakeProduct && (!customization || !customization.isComplete)
                ? 'Personalize seu bolo primeiro'
                : `Adicionar ao Carrinho - R$ ${getTotalPrice().toFixed(2)}`}
            </button>
          </div>
        </motion.div>

        {isCakeProduct && (
          <div className="mt-12">
            <CakeCustomizer
              product={product}
              onCustomizationChange={setCustomization}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
