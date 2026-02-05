import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, AlertCircle } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Opções padrão
  const [availableMassas, setAvailableMassas] = useState(['Baunilha', 'Chocolate', 'Cenoura']);
  const [availableRecheios, setAvailableRecheios] = useState(['Brigadeiro', 'Ninho', 'Doce de Leite']);

  // Escolhas do usuário
  const [massa, setMassa] = useState('');
  const [recheio, setRecheio] = useState('');
  const [cobertura, setCobertura] = useState('Chantilly'); // Padrão
  const [observacoes, setObservacoes] = useState('');

  // Opções de cobertura fixas (para manter o visual antigo)
  const coberturas = ['Chantilly', 'Ganache', 'Buttercream', 'Pasta Americana'];

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        const prodRes = await axios.get(`${API}/products/${id}`);
        setProduct(prodRes.data);

        try {
          const settingsRes = await axios.get(`${API}/settings`);
          if (settingsRes.data.available_massas) {
            setAvailableMassas(settingsRes.data.available_massas.split(',').map(item => item.trim()));
          }
          if (settingsRes.data.available_recheios) {
            setAvailableRecheios(settingsRes.data.available_recheios.split(',').map(item => item.trim()));
          }
        } catch (settingsErr) {
          console.warn("Usando configurações padrão.");
        }
      } catch (err) {
        console.error('Erro:', err);
        setErrorMsg('Erro ao carregar produto.');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPageData();
  }, [id]);

  const isCustomizable = product && (product.category.includes('Bolo') || product.category.includes('Tortas'));
  const isFormValid = !isCustomizable || (massa && recheio);

  const handleAddToCart = () => {
    if (!product) return;
    if (!isFormValid) {
      toast.error('Por favor, selecione a massa e o recheio!');
      return;
    }
    const itemToAdd = {
      ...product,
      customization: isCustomizable ? { massa, recheio, cobertura, observacoes } : null
    };
    addToCart(itemToAdd, quantity);
    toast.success(`${quantity}x ${product.name} adicionado!`);
    navigate('/catalogo');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-pink-900 font-bold">Carregando...</div>;
  if (errorMsg || !product) return <div className="p-10 text-center text-red-600">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF9]"> {/* Fundo creme suave igual ao print */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-900 mb-6 font-medium">
          <ArrowLeft size={20} /> Voltar
        </button>

        {/* --- CABEÇALHO DO PRODUTO --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[300px] rounded-2xl overflow-hidden">
               {product.image_url ? (
                 <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>
               )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold w-fit mb-2">
                    {product.category}
                </span>
                <h1 className="text-4xl font-serif font-bold text-[#4A3B32] mb-2">{product.name}</h1>
                <p className="text-gray-500 mb-4">{product.description || "Bolo delicioso feito artesanalmente."}</p>
                <div className="mt-auto">
                    <p className="text-sm text-gray-400 mb-1">Preço Base</p>
                    <p className="text-4xl font-bold text-[#D48D92]">R$ {product.price.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* --- ÁREA DE PERSONALIZAÇÃO (VISUAL ANTIGO) --- */}
        {isCustomizable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎂</span>
                <h2 className="text-2xl font-serif font-bold text-[#4A3B32]">Monte Seu Bolo Personalizado</h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                🔹 Selecione 1 massa e 1 recheio para continuar.
            </div>

            {/* SELEÇÃO DE MASSA (GRID) */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">Escolha a Massa <span className="text-red-400">*</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableMassas.map((m) => (
                        <button
                            key={m}
                            onClick={() => setMassa(m)}
                            className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center h-24 ${
                                massa === m 
                                ? 'border-[#4A3B32] bg-[#4A3B32] text-white shadow-lg scale-105' 
                                : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'
                            }`}
                        >
                            <span className="font-semibold">{m}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* SELEÇÃO DE RECHEIO (GRID) */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">Escolha o Recheio <span className="text-red-400">*</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableRecheios.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRecheio(r)}
                            className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center h-24 ${
                                recheio === r 
                                ? 'border-[#D48D92] bg-[#D48D92] text-white shadow-lg scale-105' 
                                : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'
                            }`}
                        >
                            <span className="font-semibold">{r}</span>
                        </button>
                    ))}
                </div>
            </section>

             {/* SELEÇÃO DE COBERTURA */}
             <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">Escolha a Cobertura</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {coberturas.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCobertura(c)}
                            className={`p-3 rounded-xl border transition-all text-center ${
                                cobertura === c 
                                ? 'bg-[#4A3B32] text-white font-bold' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </section>

            {/* OBSERVAÇÕES */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-2">Observações Especiais</h3>
                <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Escrever 'Parabéns Maria' no topo, sem glacê..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none h-32 bg-white"
                />
            </section>

          </motion.div>
        )}

        {/* --- BARRA FIXA DE AÇÃO --- */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-2xl z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                
                {!isFormValid && isCustomizable && (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg w-full md:w-auto text-center justify-center">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">Selecione Massa e Recheio para continuar</span>
                    </div>
                )}

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end ml-auto">
                    <div className="flex items-center border-2 border-gray-100 rounded-full bg-gray-50">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-bold hover:bg-gray-200 rounded-l-full text-lg">-</button>
                        <span className="w-8 text-center font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 font-bold hover:bg-gray-200 rounded-r-full text-lg">+</button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!isFormValid}
                        className={`px-8 py-3 rounded-full text-lg font-bold text-white transition-all shadow-lg flex items-center gap-3 ${
                            isFormValid 
                            ? 'bg-[#4A3B32] hover:bg-[#3A2B22] hover:scale-105' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingBag size={20} />
                        {isFormValid ? `Adicionar • R$ ${(product.price * quantity).toFixed(2)}` : 'Escolha as opções'}
                    </button>
                </div>
            </div>
        </div>
        
        {/* Espaço extra para não cobrir o rodapé com a barra fixa */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
