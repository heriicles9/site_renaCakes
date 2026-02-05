import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Info, CheckCircle } from 'lucide-react';
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

  // Estados de Opções (Agora dinâmicos)
  const [massasOptions, setMassasOptions] = useState([]);
  const [recheiosOptions, setRecheiosOptions] = useState([]);

  // Opções de Cobertura (Fixas por enquanto)
  const coberturasOptions = [
    { name: 'Chantilly', price: 0 },
    { name: 'Ganache', price: 0 },
    { name: 'Buttercream', price: 0 },
    { name: 'Glacê', price: 0 },
    { name: 'Pasta Americana', price: 0 },
  ];

  // Seleções do Usuário
  const [selectedMassas, setSelectedMassas] = useState([]);
  const [selectedRecheios, setSelectedRecheios] = useState([]);
  const [selectedCobertura, setSelectedCobertura] = useState(coberturasOptions[0]);
  const [observacoes, setObservacoes] = useState('');
  const [maxSelections, setMaxSelections] = useState(1);

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        const [prodRes, settingsRes] = await Promise.all([
          axios.get(`${API}/products/${id}`),
          axios.get(`${API}/settings`)
        ]);

        const prod = prodRes.data;
        setProduct(prod);
        
        // Carrega configurações do Admin ou usa padrão
        if (settingsRes.data.massas_options && settingsRes.data.massas_options.length > 0) {
          setMassasOptions(settingsRes.data.massas_options);
        } else {
          // Fallback se não configurou no Admin ainda
          setMassasOptions([{ name: 'Baunilha', price: 0 }, { name: 'Chocolate', price: 0 }]);
        }

        if (settingsRes.data.recheios_options && settingsRes.data.recheios_options.length > 0) {
          setRecheiosOptions(settingsRes.data.recheios_options);
        } else {
          setRecheiosOptions([{ name: 'Brigadeiro', price: 0 }, { name: 'Ninho', price: 0 }]);
        }

        // Regra de Limite (Tamanho Grande = 2 Sabores)
        const name = prod.name.toLowerCase();
        if (name.includes('25cm') || name.includes('30cm') || name.includes('35cm') || name.includes('40cm')) {
          setMaxSelections(2);
        } else {
          setMaxSelections(1);
        }

      } catch (err) {
        console.error('Erro:', err);
        setErrorMsg('Erro ao carregar.');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPageData();
  }, [id]);

  const isCustomizable = product && (product.category.includes('Bolo') || product.category.includes('Tortas'));
  const isFormValid = !isCustomizable || (selectedMassas.length > 0 && selectedRecheios.length > 0);

  const handleToggleOption = (item, currentList, setList) => {
    const isSelected = currentList.find(i => i.name === item.name);
    if (isSelected) {
      setList(currentList.filter(i => i.name !== item.name));
    } else {
      if (maxSelections === 1) {
        setList([item]);
      } else {
        if (currentList.length < maxSelections) {
          setList([...currentList, item]);
        } else {
          toast.warning(`Máximo de ${maxSelections} opções para este tamanho.`);
        }
      }
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    let total = product.price;
    selectedMassas.forEach(m => total += m.price);
    selectedRecheios.forEach(r => total += r.price);
    if (selectedCobertura) total += selectedCobertura.price;
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isFormValid) {
      toast.error('Selecione massa e recheio!');
      return;
    }

    const itemToAdd = {
      ...product,
      finalPrice: calculateTotal() / quantity,
      customization: isCustomizable ? { 
        massa: selectedMassas.map(m => m.name).join(' + '), 
        recheio: selectedRecheios.map(r => r.name).join(' + '), 
        cobertura: selectedCobertura.name, 
        observacoes 
      } : null
    };

    addToCart(itemToAdd, quantity);
    toast.success(`${quantity}x ${product.name} adicionado!`);
    navigate('/catalogo');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] font-bold text-pink-900">Carregando...</div>;
  if (errorMsg || !product) return <div className="p-10 text-center text-red-600 bg-[#FFFDF9]">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-900 mb-6 font-medium"><ArrowLeft size={20} /> Voltar</button>

        {/* CABEÇALHO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[300px] rounded-2xl overflow-hidden relative group">
               {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold w-fit mb-3">{product.category}</span>
                <h1 className="text-4xl font-serif font-bold text-[#4A3B32] mb-3">{product.name}</h1>
                <p className="text-gray-500 mb-6">{product.description || "Bolo artesanal."}</p>
                <div className="flex gap-4 items-end">
                  <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 w-fit">
                      <p className="text-sm text-gray-500 mb-1">Preço Base</p>
                      <p className="text-4xl font-bold text-[#D48D92]">R$ {product.price.toFixed(2)}</p>
                  </div>
                  {maxSelections > 1 && <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 font-bold text-sm h-fit mb-2">✨ Escolha até 2 sabores!</div>}
                </div>
            </div>
        </div>

        {/* PERSONALIZAÇÃO */}
        {isCustomizable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <span className="text-3xl">🎂</span>
                <div><h2 className="text-2xl font-serif font-bold text-[#4A3B32]">Monte Seu Bolo</h2><p className="text-gray-500 text-sm">Escolha <strong className="text-pink-600">{selectedMassas.length}/{maxSelections}</strong> massas e <strong className="text-pink-600">{selectedRecheios.length}/{maxSelections}</strong> recheios.</p></div>
            </div>

            {/* MASSAS */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">1. Escolha a Massa <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded-full ml-2">* Obrigatório</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {massasOptions.map((m) => {
                        const isSelected = selectedMassas.find(i => i.name === m.name);
                        return (
                            <button key={m.name} onClick={() => handleToggleOption(m, selectedMassas, setSelectedMassas)} className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[90px] ${isSelected ? 'border-[#4A3B32] bg-[#4A3B32] text-white shadow-lg scale-95' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'}`}>
                                {isSelected && <div className="absolute top-2 right-2"><CheckCircle size={16} /></div>}
                                <span className="font-bold">{m.name}</span>
                                {m.price > 0 && <span className={`text-xs mt-1 px-2 rounded-full font-bold ${isSelected ? 'bg-pink-500' : 'bg-pink-100 text-pink-700'}`}>+ R$ {m.price.toFixed(2)}</span>}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* RECHEIOS */}
            <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">2. Escolha o Recheio <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded-full ml-2">* Obrigatório</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recheiosOptions.map((r) => {
                        const isSelected = selectedRecheios.find(i => i.name === r.name);
                        return (
                            <button key={r.name} onClick={() => handleToggleOption(r, selectedRecheios, setSelectedRecheios)} className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[90px] ${isSelected ? 'border-[#D48D92] bg-[#D48D92] text-white shadow-lg scale-95' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'}`}>
                                {isSelected && <div className="absolute top-2 right-2"><CheckCircle size={16} /></div>}
                                <span className="font-bold">{r.name}</span>
                                {r.price > 0 && <span className={`text-xs mt-1 px-2 rounded-full font-bold ${isSelected ? 'bg-white text-[#D48D92]' : 'bg-pink-100 text-pink-700'}`}>+ R$ {r.price.toFixed(2)}</span>}
                            </button>
                        );
                    })}
                </div>
            </section>

             {/* COBERTURA */}
             <section>
                <h3 className="text-lg font-bold text-[#4A3B32] mb-4">3. Cobertura</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {coberturasOptions.map((c) => (
                        <button key={c.name} onClick={() => setSelectedCobertura(c)} className={`p-3 rounded-xl border transition-all ${selectedCobertura?.name === c.name ? 'bg-[#4A3B32] text-white font-bold shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{c.name}</button>
                    ))}
                </div>
            </section>

            {/* OBSERVAÇÕES */}
            <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2"><Info size={20}/> Sobre o Topo do Bolo</h3>
                <div className="text-sm text-yellow-800 mb-4 bg-white/50 p-4 rounded-lg border border-yellow-100">
                  <p><strong>Topo Simples:</strong> Incluso (Grátis). <br/> <strong>Topo 3D / Personalizado:</strong> Acréscimo a combinar no WhatsApp.</p>
                </div>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações (ex: Nome para o topo...)" className="w-full p-4 border border-gray-200 rounded-xl h-24 bg-white focus:outline-pink-300" />
            </section>
          </motion.div>
        )}

        {/* BARRA FIXA */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="hidden md:block"><p className="text-xs text-gray-500 uppercase font-bold">Total Final</p><span className="text-3xl font-bold text-[#4A3B32]">R$ {calculateTotal().toFixed(2)}</span></div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end ml-auto">
                    <div className="flex items-center bg-gray-100 rounded-full p-1"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 font-bold hover:bg-white rounded-full text-gray-600">-</button><span className="w-8 text-center font-bold text-lg">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 font-bold hover:bg-white rounded-full text-gray-600">+</button></div>
                    <button onClick={handleAddToCart} disabled={!isFormValid} className={`flex-1 md:flex-none px-8 py-3 rounded-full text-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 ${isFormValid ? 'bg-[#4A3B32] hover:bg-[#3A2B22]' : 'bg-gray-300 cursor-not-allowed'}`}><ShoppingBag size={20} /> <span className="md:hidden">R$ {calculateTotal().toFixed(2)} • </span> <span>{isFormValid ? 'Adicionar' : 'Escolha Sabores'}</span></button>
                </div>
            </div>
        </div>
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
