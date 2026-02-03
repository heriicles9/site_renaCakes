import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Filter } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { addToCart } = useCart();

  const categories = ['Todos', 'Bolos Redondos', 'Bolos Retangulares', 'Doces', 'Kits'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-brown mb-4" data-testid="catalog-heading">
            Nosso Catálogo
          </h1>
          <p className="text-lg text-brand-brown/70">
            Explore nossa seleção completa de bolos e doces artesanais.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-brand-brown" size={20} />
            <span className="font-semibold text-brand-brown">Filtrar por categoria:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all transform active:scale-95 ${
                  selectedCategory === category
                    ? 'bg-brand-brown text-white shadow-md'
                    : 'bg-white text-brand-brown border border-brand-pink hover:bg-brand-pink/30'
                }`}
                data-testid={`filter-${category.toLowerCase().replace(/ /g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow border border-brand-pink/20"
              data-testid={`product-card-${index}`}
            >
              <Link to={`/produto/${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/produto/${product.id}`}>
                  <h3 className="font-heading text-2xl font-bold text-brand-brown mb-2 hover:text-brand-rose transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.size && (
                  <p className="text-sm text-brand-brown/60 mb-1">Tamanho: {product.size}</p>
                )}
                {product.servings && (
                  <p className="text-sm text-brand-brown/60 mb-3">{product.servings}</p>
                )}
                <p className="text-brand-brown/70 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-2xl text-brand-rose">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-brand-brown text-white px-6 py-2.5 rounded-full hover:bg-brand-brown/90 transition-all transform active:scale-95 flex items-center gap-2"
                    data-testid={`add-to-cart-${index}`}
                  >
                    <ShoppingBag size={18} />
                    Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20" data-testid="no-products-message">
            <p className="text-xl text-brand-brown/60">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
