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

  // Categorias para o filtro (devem bater com o que você usa no Admin)
  const categories = ['Todos', 'Bolos', 'Doces', 'Salgados'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredProducts(products);
    } else {
      // Filtra se a categoria for exata OU se o produto contiver o nome da categoria
      // Ex: Se filtro for 'Bolos', mostra 'Bolos Redondos' também
      setFilteredProducts(products.filter((p) => 
        p.category === selectedCategory || p.category.includes(selectedCategory)
      ));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar cardápio');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado!`);
  };

  // Função inteligente para decidir se é Bolo (Personalizável)
  const isCustomizable = (category) => {
    return category && (
      category.includes('Bolo') || 
      category.includes('Tortas') ||
      category === 'Bolos Redondos' || 
      category === 'Bolos Retangulares'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-900 mb-4">Nosso Cardápio</h1>
          <p className="text-lg text-gray-600">Delícias feitas com amor para você.</p>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 border hover:bg-pink-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grade de Produtos */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-pink-100 flex flex-col"
            >
              <Link to={`/produto/${product.id}`} className="block h-64 overflow-hidden relative group">
                {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Sem Imagem</div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
              </Link>
              
              <div className="p-6 flex-1 flex flex-col">
                <Link to={`/produto/${product.id}`}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 hover:text-pink-600">{product.name}</h3>
                </Link>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-2xl font-bold text-pink-600">R$ {product.price.toFixed(2)}</span>
                  
                  {/* LÓGICA CORRIGIDA AQUI */}
                  {isCustomizable(product.category) ? (
                    <Link
                      to={`/produto/${product.id}`}
                      className="bg-pink-900 text-white px-5 py-2 rounded-full font-bold hover:bg-pink-800 flex items-center gap-2 text-sm shadow-md"
                    >
                      <Filter size={16} /> Personalizar
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-green-600 text-white px-5 py-2 rounded-full font-bold hover:bg-green-700 flex items-center gap-2 text-sm shadow-md"
                    >
                      <ShoppingBag size={16} /> Adicionar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
