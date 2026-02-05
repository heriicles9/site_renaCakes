import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  
  // Opções vindas do Backend (Configurações)
  const [availableMassas, setAvailableMassas] = useState([]);
  const [availableRecheios, setAvailableRecheios] = useState([]);

  // Escolhas do usuário
  const [massa, setMassa] = useState('');
  const [recheio, setRecheio] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Busca o Produto E as Configurações ao mesmo tempo
      const [prodRes, settingsRes] = await Promise.all([
        axios.get(`${API}/products/${id}`),
        axios.get(`${API}/settings`)
      ]);

      setProduct(prodRes.data);

      // Processa as massas e recheios (transforma a string "A, B, C" em array ["A", "B", "C"])
      if (settingsRes.data.available_massas) {
        setAvailableMassas(settingsRes.data.available_massas.split(',').map(item => item.trim()));
      }
      if (settingsRes.data.available_recheios) {
        setAvailableRecheios(settingsRes.data.available_recheios.split(',').map(item => item.trim()));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Produto não encontrado ou erro de conexão.');
      navigate('/catalogo');
    }
  };

  const isCustomizable = product && product.category === 'Bolos';

  // Verifica se o formulário está válido
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
    navigate('/catalogo'); // Opcional: voltar para comprar mais
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-pink-900 animate-pulse">Carregando delícia...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 font-medium">
          <ArrowLeft size={20} /> Voltar para o Cardápio
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FOTO DO PRODUTO */}
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="rounded-2xl overflow-hidden shadow-2xl h-[400px] lg:h-[600px] border-4 border-white">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Sem Foto</div>
            )}
          </motion.div>

          {/* DETALHES E PERSONALIZAÇÃO */}
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-pink-600 font-bold text-3xl mb-6">R$ {product.price.toFixed(2)}</p>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              {product.description || "Sem descrição detalhada."}
            </p>

            {/* ÁREA DE PERSONALIZAÇÃO (SÓ APARECE PARA BOLOS) */}
            {isCustomizable && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-pink-100 mb-8">
                <h3 className="text-xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                   🎨 Personalize seu Bolo
                </h3>

                {/* Seleção de Massa */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Escolha a Massa:</label>
                  <select 
                    value={massa} 
                    onChange={(e) => setMassa(e.target.value)}
                    className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="">Selecione...</option>
                    {availableMassas.length > 0 ? (
                      availableMassas.map((m, i) => <option key={i} value={m}>{m}</option>)
                    ) : (
                      // Fallback se não tiver nada configurado
                      <>
                        <option value="Baunilha">Baunilha</option>
                        <option value="Chocolate">Chocolate</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Seleção de Recheio */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Escolha o Recheio:</label>
                  <select 
                    value={recheio} 
                    onChange={(e) => setRecheio(e.target.value)}
                    className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="">Selecione...</option>
                    {availableRecheios.length > 0 ? (
                      availableRecheios.map((r, i) => <option key={i} value={r}>{r}</option>)
                    ) : (
                      <>
                        <option value="Brigadeiro">Brigadeiro</option>
                        <option value="Doce de Leite">Doce de Leite</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Observações (opcional):</label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Escrever 'Parabéns'..."
                    className="w-full p-3 bg-gray-50 border rounded-lg h-24 focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* CONTROLES FINAIS */}
            <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center border-2 border-gray-200 rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 font-bold hover:bg-gray-100 rounded-l-full text-lg">-</button>
                  <span className="px-4 font-bold text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 font-bold hover:bg-gray-100 rounded-r-full text-lg">+</button>
               </div>
               <div className="text-gray-500 text-sm">unidades</div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full text-xl font-bold text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={24} />
              {isFormValid 
                ? `Adicionar - R$ ${(product.price * quantity).toFixed(2)}`
                : 'Selecione Massa e Recheio'}
            </button>

          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
