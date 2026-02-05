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

  // --- NOVAS CATEGORIAS (IGUAL FOTO 2) ---
  const categories = ['Todos', 'Bolos Redondos', 'Bolos Retangulares', 'Doces', 'Kits'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredProducts(products);
    } else {
      // Filtra exatamente pelo nome da categoria
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
      toast.error('Erro ao carregar cardápio');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado!`);
  };

  // Verifica se é personalizável (Qualquer coisa com "Bolo" no nome entra aqui)
  const isCustomizable = (category) => {
    return category && (category.includes('Bolo') || category.includes('Tortas'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* CABEÇALHO IGUAL FOTO 2 */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#4A3B32] mb-3">
            Nosso Catálogo
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Explore nossa seleção completa de bolos e doces artesanais.
          </p>
        </motion.div>

        {/* FILTROS COM ÍCONE */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-[#4A3B32] font-medium">
             <Filter size={20} />
             <span>Filtrar por categoria:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm md:text-base ${
                  selectedCategory === category
                    ? 'bg-[#4A3B32] text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#D48D92] hover:text-[#D48D92]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* GRADE DE PRODUTOS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col group"
            >
              <Link to={`/produto/${product.id}`} className="block h-64 overflow-hidden relative">
                {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                   <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Sem Imagem</div>
                )}
                {/* Overlay suave ao passar o mouse */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              </Link>
              
              <div className="p-6 flex-1 flex flex-col">
                <Link to={`/produto/${product.id}`}>
                  <h3 className="font-serif text-2xl font-bold text-[#4A3B32] mb-2 group-hover:text-[#D48D92] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1 font-light">
                    {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <span className="text-2xl font-bold text-[#D48D92]">R$ {product.price.toFixed(2)}</span>
                  
                  {isCustomizable(product.category) ? (
                    <Link
                      to={`/produto/${product.id}`}
                      className="bg-[#4A3B32] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#3A2B22] flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
                    >
                      <ShoppingBag size={16} /> Personalizar
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
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
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-xl text-gray-400 font-light">Nenhum produto encontrado na categoria <strong>{selectedCategory}</strong>.</p>
            <button onClick={() => setSelectedCategory('Todos')} className="mt-4 text-[#D48D92] font-bold hover:underline">
                Ver todos os produtos
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
