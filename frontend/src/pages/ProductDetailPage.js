import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); // Para ver o erro na tela
  const [quantity, setQuantity] = useState(1);
  
  // Opções padrão caso o backend de configurações falhe
  const [availableMassas, setAvailableMassas] = useState(['Baunilha', 'Chocolate', 'Cenoura']);
  const [availableRecheios, setAvailableRecheios] = useState(['Brigadeiro', 'Ninho', 'Doce de Leite']);

  // Escolhas do usuário
  const [massa, setMassa] = useState('');
  const [recheio, setRecheio] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        // 1. Tenta buscar o Produto (Prioridade Máxima)
        console.log(`Buscando produto: ${API}/products/${id}`);
        const prodRes = await axios.get(`${API}/products/${id}`);
        setProduct(prodRes.data);

        // 2. Tenta buscar Configurações (Se falhar, não quebra a página)
        try {
          const settingsRes = await axios.get(`${API}/settings`);
          if (settingsRes.data.available_massas) {
            setAvailableMassas(settingsRes.data.available_massas.split(',').map(item => item.trim()));
          }
          if (settingsRes.data.available_recheios) {
            setAvailableRecheios(settingsRes.data.available_recheios.split(',').map(item => item.trim()));
          }
        } catch (settingsErr) {
          console.warn("Não foi possível carregar configurações personalizadas. Usando padrão.", settingsErr);
          // Não faz nada, mantém os arrays padrão definidos no useState
        }

      } catch (err) {
        console.error('Erro fatal ao carregar produto:', err);
        setErrorMsg('Erro ao carregar produto. Verifique se o Backend foi atualizado.');
        // Se der erro no produto, aí sim avisamos
        if (err.response && err.response.status === 404) {
          toast.error('Produto não encontrado no sistema.');
        } else {
          toast.error('Erro de conexão com o servidor.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPageData();
    }
  }, [id]);

  const isCustomizable = product && (product.category.includes('Bolo') || product.category.includes('Tortas'));
  const isFormValid = !isCustomizable || (massa && recheio);

  const handleAddToCart = () => {
    if (!product) return;

    if (!isFormValid) {
      toast.error('Por favor, escolha a massa e o recheio!');
      return;
    }

    const itemToAdd = {
      ...product,
      customization: isCustomizable ? { massa, recheio, observacoes } : null
    };

    addToCart(itemToAdd, quantity);
    toast.success(`${quantity}x ${product.name} adicionado!`);
    navigate('/catalogo');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-pink-900 animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-gray-700 mb-4">{errorMsg || "Produto não encontrado."}</p>
        <button onClick={() => navigate('/catalogo')} className="bg-pink-600 text-white px-6 py-2 rounded-full">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 font-medium">
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FOTO DO PRODUTO */}
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white h-[400px] lg:h-[500px]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">Sem Foto</div>
            )}
          </motion.div>

          {/* DETALHES */}
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-pink-600 font-bold text-3xl mb-6">R$ {product.price.toFixed(2)}</p>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              {product.description || "Sem descrição."}
            </p>

            {/* PERSONALIZAÇÃO */}
            {isCustomizable && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-pink-100 mb-8">
                <h3 className="text-xl font-bold text-pink-900 mb-4">🎨 Personalize seu Bolo</h3>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Massa:</label>
                  <select value={massa} onChange={(e) => setMassa(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg">
                    <option value="">Selecione...</option>
                    {availableMassas.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Recheio:</label>
                  <select value={recheio} onChange={(e) => setRecheio(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg">
                    <option value="">Selecione...</option>
                    {availableRecheios.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Observações:</label>
                  <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg h-20" placeholder="Ex: Escrever parabéns..." />
                </div>
              </div>
            )}

            {/* BOTÃO DE ADICIONAR */}
            <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center border border-gray-300 rounded-full bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 font-bold hover:bg-gray-100 rounded-l-full">-</button>
                  <span className="px-4 font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 font-bold hover:bg-gray-100 rounded-r-full">+</button>
               </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full text-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={24} />
              {isFormValid ? 'Adicionar ao Carrinho' : 'Selecione as opções'}
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
