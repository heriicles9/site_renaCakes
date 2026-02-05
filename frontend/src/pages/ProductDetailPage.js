import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, AlertCircle, Info } from 'lucide-react';
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

  // --- TABELAS DE PREÇOS E OPÇÕES ---
  
  const massasOptions = [
    { name: 'Tradicional', price: 0 },
    { name: 'Baunilha', price: 0 },
    { name: 'Chocolate', price: 0 },
    { name: 'Coco', price: 0 },
    { name: 'Amendoim', price: 22 },
    { name: 'Red Velvet', price: 32 },
    { name: 'Nozes', price: 38 },
    { name: 'Black', price: 42 },
  ];

  const recheiosOptions = [
    // Clássicos (Sem custo extra)
    { name: 'Chocolate Belga', price: 0 },
    { name: 'Quatro Leites', price: 0 },
    { name: 'Brigadeiro Branco', price: 0 },
    { name: 'Beijinho', price: 0 },
    { name: 'Limão Siciliano', price: 0 },
    { name: 'Mousse de Maracujá', price: 0 },
    { name: 'Ameixa', price: 0 },
    { name: 'Pistache', price: 0 },
    { name: 'Doce de Leite', price: 0 },
    
    // Especiais (Com custo)
    { name: 'Abacaxi c/ Coco', price: 22 },
    { name: 'Mousse Flocado', price: 28 },
    { name: 'Amêndoas', price: 32 },
    { name: 'Bombom', price: 32 },
    { name: 'Geleia Frutas Amarelas', price: 38 },
    { name: 'Cereja', price: 38 },
    { name: 'Nozes', price: 38 },
    { name: 'Damasco', price: 38 },
    { name: 'Geleia Frutas Vermelhas', price: 42 },
    { name: 'Geleia Morango Fresco', price: 42 },
    { name: 'Nutella', price: 42 },
  ];

  const coberturasOptions = [
    { name: 'Chantilly', price: 0 },
    { name: 'Ganache', price: 0 },
    { name: 'Buttercream', price: 0 },
    { name: 'Glacê', price: 0 },
    { name: 'Pasta Americana', price: 0 },
  ];

  // Estados de Seleção (Guardamos o Objeto inteiro {name, price})
  const [selectedMassa, setSelectedMassa] = useState(null);
  const [selectedRecheio, setSelectedRecheio] = useState(null);
  const [selectedCobertura, setSelectedCobertura] = useState(coberturasOptions[0]); // Chantilly padrão
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        const prodRes = await axios.get(`${API}/products/${id}`);
        setProduct(prodRes.data);
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
  const isFormValid = !isCustomizable || (selectedMassa && selectedRecheio);

  // Cálculo do Preço Total Unitário
  const calculateUnitPrice = () => {
    if (!product) return 0;
    let total = product.price;
    if (selectedMassa) total += selectedMassa.price;
    if (selectedRecheio) total += selectedRecheio.price;
    if (selectedCobertura) total += selectedCobertura.price;
    return total;
  };

  const finalUnitPrice = calculateUnitPrice();
  const finalTotalPrice = finalUnitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;
    if (!isFormValid) {
      toast.error('Por favor, selecione a massa e o recheio!');
      return;
    }
    const itemToAdd = {
      ...product,
      finalPrice: finalUnitPrice, // Salva o preço real calculado
      customization: isCustomizable ? { 
        massa: selectedMassa.name, 
        recheio: selectedRecheio.name, 
        cobertura: selectedCobertura.name, 
        observacoes 
      } : null
    };
    addToCart(itemToAdd, quantity);
    toast.success(`${quantity}x ${product.name} adicionado!`);
    navigate('/catalogo');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] text-pink-900 font-bold">Carregando...</div>;
  if (errorMsg || !product) return <div className="p-10 text-center text-red-600 bg-[#FFFDF9]">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-900 mb-6 font-medium">
          <ArrowLeft size={20} /> Voltar
        </button>

        {/* --- CABEÇALHO DO PRODUTO --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[300px] rounded-2xl overflow-hidden shadow-inner">
               {product.image_url ? (
                 <img src={product.image_url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>
               )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold w-fit mb-3">
                    {product.category}
                </span>
                <h1 className="text-4xl font-serif font-bold text-[#4A3B32] mb-3">{product.name}</h1>
                <p className="text-gray-500 mb-6 leading-relaxed">{product.description || "Bolo artesanal feito com ingredientes selecionados."}</p>
                
                <div className="mt-auto bg-pink-50/50 p-4 rounded-xl border border-pink-100 w-fit">
                    <p className="text-sm text-gray-500 mb-1">Preço Base do Tamanho</p>
                    <p className="text-4xl font-bold text-[#D48D92]">R$ {product.price.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* --- ÁREA DE PERSONALIZAÇÃO --- */}
        {isCustomizable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <span className="text-3xl">🎂</span>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#4A3B32]">Monte Seu Bolo</h2>
                  <p className="text-gray-500 text-sm">Personalize cada detalhe do seu pedido</p>
                </div>
            </div>

            {/* SELEÇÃO DE MASSA */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4 flex items-center gap-2">
                  1. Escolha a Massa <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded-full">* Obrigatório</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {massasOptions.map((m) => (
                        <button
                            key={m.name}
                            onClick={() => setSelectedMassa(m)}
                            className={`relative p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[90px] ${
                                selectedMassa?.name === m.name
                                ? 'border-[#4A3B32] bg-[#4A3B32] text-white shadow-lg scale-105 z-10' 
                                : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'
                            }`}
                        >
                            <span className="font-semibold text-sm md:text-base">{m.name}</span>
                            {m.price > 0 && (
                                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full font-bold ${
                                  selectedMassa?.name === m.name ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'
                                }`}>
                                    + R$ {m.price.toFixed(2)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* SELEÇÃO DE RECHEIO */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4 flex items-center gap-2">
                  2. Escolha o Recheio <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded-full">* Obrigatório</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {recheiosOptions.map((r) => (
                        <button
                            key={r.name}
                            onClick={() => setSelectedRecheio(r)}
                            className={`relative p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[90px] ${
                                selectedRecheio?.name === r.name
                                ? 'border-[#D48D92] bg-[#D48D92] text-white shadow-lg scale-105 z-10' 
                                : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'
                            }`}
                        >
                            <span className="font-semibold text-sm">{r.name}</span>
                            {r.price > 0 && (
                                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full font-bold ${
                                  selectedRecheio?.name === r.name ? 'bg-white text-[#D48D92]' : 'bg-pink-100 text-pink-700'
                                }`}>
                                    + R$ {r.price.toFixed(2)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </section>

             {/* SELEÇÃO DE COBERTURA */}
             <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">3. Escolha a Cobertura</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {coberturasOptions.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => setSelectedCobertura(c)}
                            className={`p-3 rounded-xl border transition-all text-center ${
                                selectedCobertura?.name === c.name
                                ? 'bg-[#4A3B32] text-white font-bold shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* OBSERVAÇÕES E AVISOS */}
            <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <Info size={20}/> Observações Importantes
                </h3>
                
                <div className="text-sm text-yellow-800 mb-4 bg-white/50 p-3 rounded-lg border border-yellow-100">
                  <p>⚠️ <strong>Sobre o Topo do Bolo:</strong></p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>O valor do <strong>topo simples</strong> já está incluso no preço do bolo.</li>
                    <li>Topos <strong>3D ou personalizados</strong> terão acréscimo no valor (consultar via WhatsApp após o pedido).</li>
                  </ul>
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-2">Alguma observação especial?</label>
                <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Escrever 'Parabéns Maria' no topo simples, retirar lactose..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none h-24 bg-white"
                />
            </section>

          </motion.div>
        )}

        {/* --- BARRA FIXA DE TOTAL --- */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Resumo do Pedido (Desktop) */}
                <div className="hidden md:block">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total do Pedido</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#4A3B32]">R$ {finalTotalPrice.toFixed(2)}</span>
                      {quantity > 1 && <span className="text-gray-400 text-sm">(R$ {finalUnitPrice.toFixed(2)} cada)</span>}
                    </div>
                </div>

                {/* Controles e Botão */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end ml-auto">
                    
                    {/* Seletor de Quantidade */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-bold hover:bg-white rounded-full transition-all text-gray-600">-</button>
                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 font-bold hover:bg-white rounded-full transition-all text-gray-600">+</button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!isFormValid}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-full text-lg font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 min-w-[200px] ${
                            isFormValid 
                            ? 'bg-[#4A3B32] hover:bg-[#3A2B22] hover:scale-105' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingBag size={20} />
                        <span className="md:hidden">R$ {finalTotalPrice.toFixed(2)} • </span>
                        <span>Adicionar</span>
                    </button>
                </div>
            </div>
        </div>
        
        {/* Espaço para não cobrir conteúdo */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
