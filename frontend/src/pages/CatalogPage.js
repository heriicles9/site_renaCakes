import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Filter, PlayCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // --- MEMÓRIA DE FILTRO: Lê o último salvo ou começa em 'Todos' ---
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('catalogFilter') || 'Todos';
  });

  const categories = ['Todos', 'Bolos Redondos', 'Bolos Retangulares', 'Bolos em Movimento', 'Doces', 'Kits'];

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- SALVA O FILTRO SEMPRE QUE MUDAR ---
  useEffect(() => {
    sessionStorage.setItem('catalogFilter', selectedCategory);
    
    let result = products;
    if (selectedCategory !== 'Todos') {
      result = products.filter((p) => p.category === selectedCategory);
    }
    result.sort((a, b) => a.price - b.price);
    setFilteredProducts([...result]);
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao conectar com o servidor. Tente recarregar.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado!`);
  };

  const isCustomizable = (category) => {
    return category && (category.includes('Bolo') || category.includes('Tortas') || category === 'Doces');
  };

  const isVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.webm'));
  };

  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[400px]">
      <div className="h-64 bg-gray-200 animate-pulse" />
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center md:text-left">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#4A3B32] mb-3">
            Nosso Catálogo
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Explore nossa seleção completa de bolos e doces artesanais.
          </p>
        </motion.div>

        {/* FILTROS */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-[#4A3B32] font-medium justify-center md:justify-start">
             <Filter size={20} />
             <span>Filtrar por categoria:</span>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm md:text-base ${
                  selectedCategory === category
                    ? 'bg-[#4A3B32] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#D48D92] hover:text-[#D48D92]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* GRADE DE PRODUTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <>
              <ProductSkeleton /><ProductSkeleton /><ProductSkeleton />
              <ProductSkeleton /><ProductSkeleton /><ProductSkeleton />
            </>
          ) : (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col group"
              >
                <Link to={`/produto/${product.id}`} className="block h-64 overflow-hidden relative bg-gray-100">
                  {product.image_url ? (
                     isVideo(product.image_url) ? (
                        <video 
                          src={product.image_url} 
                          autoPlay muted loop playsInline 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     )
                  ) : (
                     <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Sem Imagem</div>
                  )}
                  {isVideo(product.image_url) && (
                    <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-[#4A3B32] shadow-sm">
                      <PlayCircle size={20} />
                    </div>
                  )}
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
            ))
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 mx-auto w-full">
            <p className="text-xl text-gray-400 font-light mb-2">
              Nenhum produto encontrado em <strong>{selectedCategory}</strong>.
            </p>
            <button onClick={() => setSelectedCategory('Todos')} className="text-[#D48D92] font-bold hover:underline border border-[#D48D92] px-4 py-2 rounded-full hover:bg-pink-50">
                Limpar Filtros
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
