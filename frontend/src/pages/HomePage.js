import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [videoProducts, setVideoProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const allProducts = response.data;

      // 1. Filtra produtos marcados como destaque (mantendo sua lógica original)
      const featured = allProducts.filter((p) => p.featured).slice(0, 3);
      setFeaturedProducts(featured);

      // 2. Filtra produtos da categoria "Bolos em Movimento"
      const videos = allProducts.filter(p => p.category === 'Bolos em Movimento');
      setVideoProducts(videos);

    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  // Função para verificar se é vídeo
  const isVideo = (url) => url && (url.includes('.mp4') || url.includes('.webm'));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* --- HERO SECTION (Original) --- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1737189409843-c86c2d4770fd?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cream/95 via-brand-pink/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-brand-brown mb-6 leading-tight" data-testid="hero-heading">
              Doces Momentos,{' '}
              <span className="text-brand-rose">Sabores Inesquecíveis</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-brown/80 mb-8 leading-relaxed">
              Bolos artesanais e doces finos feitos com amor e dedicação para tornar suas celebrações verdadeiramente especiais.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-brand-brown text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-brown/90 shadow-lg hover:shadow-xl transform transition-all hover:scale-105 active:scale-95"
              data-testid="hero-cta-button"
            >
              <ShoppingBag size={24} />
              Ver Catálogo
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* --- SEÇÃO NOVA: BOLOS EM MOVIMENTO --- */}
      {videoProducts.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-brand-rose font-bold uppercase tracking-widest text-sm">Experiência Visual</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-brown mt-2 mb-4">
                ✨ Bolos em Movimento
              </h2>
              <p className="text-lg text-brand-brown/70 max-w-2xl mx-auto">
                Veja a mágica e os detalhes dos nossos bolos especiais em ação.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videoProducts.map((product, index) => (
                <Link to={`/produto/${product.id}`} key={product.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative rounded-3xl overflow-hidden shadow-xl h-[450px] border border-brand-pink/20"
                  >
                    <div className="absolute inset-0 bg-black">
                      {isVideo(product.image_url) ? (
                        <video 
                          src={product.image_url} 
                          autoPlay muted loop playsInline 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
                        />
                      ) : (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    
                    {/* Gradiente e Informações sobre o vídeo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-white text-xs font-bold mb-3 flex items-center gap-1 border border-white/30">
                        <PlayCircle size={14} /> Assista Agora
                      </div>
                      <h3 className="font-heading text-3xl font-bold text-white mb-2">{product.name}</h3>
                      <div className="flex justify-between items-end">
                        <p className="text-gray-200 line-clamp-2 text-sm max-w-[70%] font-light">{product.description}</p>
                        <span className="text-brand-rose font-bold text-xl bg-white/10 backdrop-blur-md px-4 py-1 rounded-lg border border-white/10">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- DESTAQUES (Original) --- */}
      <section className="py-20 px-6 bg-brand-cream/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-brown mb-4" data-testid="featured-section-heading">
              Nossos Destaques
            </h2>
            <p className="text-lg text-brand-brown/70 max-w-2xl mx-auto">
              Conheça nossos produtos mais procurados e apaixone-se pelos sabores.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow border border-brand-pink/20"
                data-testid={`featured-product-${index}`}
              >
                <div className="aspect-square overflow-hidden">
                  {product.image_url ? (
                     isVideo(product.image_url) ? (
                        <video src={product.image_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                     ) : (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                     )
                  ) : (
                     <img src="https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Sem imagem" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl font-bold text-brand-brown mb-2">
                    {product.name}
                  </h3>
                  <p className="text-brand-brown/70 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-brand-rose">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {(product.category && (product.category.includes('Bolo') || product.category === 'Doces')) ? (
                      <Link
                        to={`/produto/${product.id}`}
                        className="bg-brand-brown text-white px-6 py-2.5 rounded-full hover:bg-brand-brown/90 transition-all transform active:scale-95 flex items-center gap-2"
                      >
                        <ShoppingBag size={18} />
                        Personalizar
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-brand-brown text-white px-6 py-2.5 rounded-full hover:bg-brand-brown/90 transition-all transform active:scale-95 flex items-center gap-2"
                      >
                        <ShoppingBag size={18} />
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-brand-pink text-brand-brown px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-pink/80 transition-all transform hover:scale-105 active:scale-95"
              data-testid="view-all-products-button"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* --- BENEFÍCIOS (Original) --- */}
      <section className="py-20 px-6 bg-brand-pink/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <Star className="mx-auto mb-4 text-brand-rose" size={48} />
              <h3 className="font-heading text-xl font-bold text-brand-brown mb-2">
                Qualidade Premium
              </h3>
              <p className="text-brand-brown/70">
                Ingredientes selecionados para garantir o melhor sabor.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <Heart className="mx-auto mb-4 text-brand-rose" size={48} />
              <h3 className="font-heading text-xl font-bold text-brand-brown mb-2">
                Feito com Amor
              </h3>
              <p className="text-brand-brown/70">
                Cada doce é preparado artesanalmente com muito carinho.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <ShoppingBag className="mx-auto mb-4 text-brand-rose" size={48} />
              <h3 className="font-heading text-xl font-bold text-brand-brown mb-2">
                Entrega Rápida
              </h3>
              <p className="text-brand-brown/70">
                Receba seus pedidos com agilidade e segurança.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
