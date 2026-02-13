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

  // --- LISTAS E CONFIGS (Mantive suas listas originais aqui) ---
  const defaultMassas = [{ name: 'Tradicional', price: 0 }, { name: 'Baunilha', price: 0 }, { name: 'Chocolate', price: 0 }, { name: 'Coco', price: 0 }, { name: 'Amendoim', price: 22 }, { name: 'Red Velvet', price: 32 }, { name: 'Nozes', price: 38 }, { name: 'Black', price: 42 }];
  const defaultRecheios = [{ name: 'Chocolate Belga', price: 0 }, { name: 'Quatro Leites', price: 0 }, { name: 'Brigadeiro Branco', price: 0 }, { name: 'Beijinho', price: 0 }, { name: 'Limão Siciliano', price: 0 }, { name: 'Mousse de Maracujá', price: 0 }, { name: 'Ameixa', price: 0 }, { name: 'Pistache', price: 0 }, { name: 'Doce de Leite', price: 0 }, { name: 'Abacaxi c/ Coco', price: 22 }, { name: 'Mousse Flocado', price: 28 }, { name: 'Amêndoas', price: 32 }, { name: 'Bombom', price: 32 }, { name: 'Geleia Frutas Amarelas', price: 38 }, { name: 'Cereja', price: 38 }, { name: 'Nozes', price: 38 }, { name: 'Damasco', price: 38 }, { name: 'Geleia Frutas Vermelhas', price: 42 }, { name: 'Geleia Morango Fresco', price: 42 }, { name: 'Nutella', price: 42 }];
  const coberturasOptions = [{ name: 'Chantilly', price: 0 }, { name: 'Ganache', price: 0 }, { name: 'Buttercream', price: 0 }, { name: 'Glacê', price: 0 }, { name: 'Pasta Americana', price: 0 }];

  // Doces
  const docesComuns = ['Brigadeiro Preto', 'Beijinho', 'Cajuzinho', 'Limãozinho', 'Brigadeiro Branco', 'Brigadeiro com Flocos', 'Ninho com Amendoim', 'Casadinho de Ninho'];
  const docesFinos = ['Morango Coberto', 'Coco com Ameixa', 'Coco com Damasco', 'Coco com Cereja'];
  const docesGourmet = ['Brigadeiro Gourmet', 'Brigadeiro de Ninho', 'Brigadeiro de Limão', 'Brigadeiro de Maracujá', 'Brigadeiro Capim Santo', 'Bombom de Uva', 'Bombom de Banana', 'Bombom de Goiaba', 'Tortinha Cream Cheese', 'Tortinha Limão', 'Tortinha Morango', 'Tortinha Maracujá c/ Coco', 'Tortinha Physalis'];

  // Estados
  const [massasOptions, setMassasOptions] = useState([]);
  const [recheiosOptions, setRecheiosOptions] = useState([]);
  const [selectedMassas, setSelectedMassas] = useState([]);
  const [selectedRecheios, setSelectedRecheios] = useState([]);
  const [selectedDoces, setSelectedDoces] = useState([]); 
  const [selectedCobertura, setSelectedCobertura] = useState(coberturasOptions[0]);
  const [observacoes, setObservacoes] = useState('');
  const [maxSelections, setMaxSelections] = useState(1);
  const [isDoce, setIsDoce] = useState(false);
  const [docesOptions, setDocesOptions] = useState([]);

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
        
        const category = prod.category || '';
        const nameLower = prod.name.toLowerCase();

        if (category === 'Doces' || nameLower.includes('doce') || nameLower.includes('cento')) {
          setIsDoce(true);
          setQuantity(50);
          if (nameLower.includes('fino')) setDocesOptions(docesFinos);
          else if (nameLower.includes('gourmet')) setDocesOptions(docesGourmet);
          else setDocesOptions(docesComuns);
        } else {
          setIsDoce(false);
          setQuantity(1);
          if (settingsRes.data.massas_options?.length > 0) setMassasOptions(settingsRes.data.massas_options);
          else setMassasOptions(defaultMassas);
          if (settingsRes.data.recheios_options?.length > 0) setRecheiosOptions(settingsRes.data.recheios_options);
          else setRecheiosOptions(defaultRecheios);
          
          if (
            nameLower.includes('20cm') || nameLower.includes('25cm') || nameLower.includes('30cm') || 
            nameLower.includes('35cm') || nameLower.includes('40cm') || nameLower.includes('45cm') ||
            nameLower.includes('50cm') || nameLower.includes('55cm') || nameLower.includes('75cm') ||
            nameLower.includes('retangular')
          ) {
            setMaxSelections(2);
          } else {
            setMaxSelections(1);
          }
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

  useEffect(() => {
    if (isDoce) {
      if (quantity === 50) setMaxSelections(2); 
      else setMaxSelections(4);
    }
  }, [quantity, isDoce]);

  const isCustomizable = product && (product.category.includes('Bolo') || product.category.includes('Tortas') || product.category === 'Doces');
  
  const isFormValid = !isCustomizable || (
    isDoce 
      ? (selectedDoces.length > 0 && selectedDoces.length <= maxSelections) 
      : (selectedMassas.length > 0 && selectedRecheios.length > 0)
  );

  const handleToggleOption = (item, currentList, setList, isPriceObj = true) => {
    const itemName = isPriceObj ? item.name : item;
    const isSelected = currentList.find(i => (isPriceObj ? i.name : i) === itemName);
    if (isSelected) setList(currentList.filter(i => (isPriceObj ? i.name : i) !== itemName));
    else {
      if (maxSelections === 1 && !isDoce) setList([item]); 
      else {
        if (currentList.length < maxSelections) setList([...currentList, item]);
        else toast.warning(`Limite de ${maxSelections} opções.`);
      }
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    if (isDoce) {
      const pricePerUnit = product.price / 100;
      return pricePerUnit * quantity;
    } else {
      let total = product.price;
      selectedMassas.forEach(m => total += m.price);
      selectedRecheios.forEach(r => total += r.price);
      if (selectedCobertura) total += selectedCobertura.price;
      return total * quantity;
    }
  };

  const updateQuantity = (change) => {
    if (isDoce) {
      const newQty = quantity + (change * 50);
      setQuantity(Math.max(50, newQty));
    } else {
      const newQty = quantity + change;
      setQuantity(Math.max(1, newQty));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isDoce && selectedDoces.length > maxSelections) { toast.error(`Limite excedido.`); return; }
    if (!isFormValid) { toast.error(isDoce ? 'Escolha sabores!' : 'Selecione massa/recheio!'); return; }
    
    const totalCalculated = calculateTotal();
    const itemToAdd = {
      ...product,
      name: isDoce ? `${product.name} (${quantity} un)` : product.name,
      finalPrice: isDoce ? totalCalculated : (totalCalculated / quantity),
      customization: isCustomizable ? { 
        massa: isDoce ? 'N/A' : selectedMassas.map(m => m.name).join(' + '), 
        recheio: isDoce ? 'N/A' : selectedRecheios.map(r => r.name).join(' + '), 
        saboresDoces: isDoce ? selectedDoces.join(', ') : null,
        cobertura: isDoce ? 'N/A' : selectedCobertura.name, 
        observacoes 
      } : null
    };
    addToCart(itemToAdd, isDoce ? 1 : quantity);
    toast.success('Adicionado ao carrinho!');
    navigate('/catalogo');
  };

  // VERIFICADOR DE VÍDEO
  const isVideo = (url) => url && (url.includes('.mp4') || url.includes('.webm'));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] font-bold text-pink-900">Carregando...</div>;
  if (errorMsg || !product) return <div className="p-10 text-center text-red-600 bg-[#FFFDF9]">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-pink-900 mb-6 font-medium"><ArrowLeft size={20} /> Voltar</button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[300px] rounded-2xl overflow-hidden relative group bg-black">
               {product.image_url ? (
                 isVideo(product.image_url) ? (
                    <video src={product.image_url} autoPlay loop muted playsInline controls className="w-full h-full object-contain" />
                 ) : (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 )
               ) : <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold w-fit mb-3">{product.category}</span>
                <h1 className="text-4xl font-serif font-bold text-[#4A3B32] mb-3">{product.name}</h1>
                <p className="text-gray-500 mb-6">{product.description || "Delícia artesanal."}</p>
                <div className="flex gap-4 items-end">
                  <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 w-fit">
                      <p className="text-sm text-gray-500 mb-1">Preço</p>
                      <p className="text-4xl font-bold text-[#D48D92]">R$ {product.price.toFixed(2)}</p>
                  </div>
                </div>
            </div>
        </div>

        {/* --- PERSONALIZAÇÃO (Mantido igual) --- */}
        {isCustomizable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {!isDoce && (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200"><span className="text-3xl">🎂</span><div><h2 className="text-2xl font-serif font-bold text-[#4A3B32]">Monte Seu Bolo</h2><p className="text-gray-500 text-sm">Escolha <strong className="text-pink-600">{selectedMassas.length}/{maxSelections}</strong> massas e <strong className="text-pink-600">{selectedRecheios.length}/{maxSelections}</strong> recheios.</p></div></div>
                <section><h3 className="text-lg font-bold text-[#4A3B32] mb-4">1. Escolha a Massa</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{massasOptions.map((m) => { const isSelected = selectedMassas.find(i => i.name === m.name); return (<button key={m.name} onClick={() => handleToggleOption(m, selectedMassas, setSelectedMassas)} className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[90px] ${isSelected ? 'border-[#4A3B32] bg-[#4A3B32] text-white shadow-lg scale-95' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'}`}>{isSelected && <div className="absolute top-2 right-2"><CheckCircle size={16} /></div>}<span className="font-bold text-center">{m.name}</span>{m.price > 0 && <span className="text-xs mt-1 px-2 bg-pink-100 text-pink-700 rounded-full">+ R$ {m.price}</span>}</button>); })}</div></section>
                <section><h3 className="text-lg font-bold text-[#4A3B32] mb-4">2. Escolha o Recheio</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{recheiosOptions.map((r) => { const isSelected = selectedRecheios.find(i => i.name === r.name); return (<button key={r.name} onClick={() => handleToggleOption(r, selectedRecheios, setSelectedRecheios)} className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[90px] ${isSelected ? 'border-[#D48D92] bg-[#D48D92] text-white shadow-lg scale-95' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'}`}>{isSelected && <div className="absolute top-2 right-2"><CheckCircle size={16} /></div>}<span className="font-bold text-center">{r.name}</span>{r.price > 0 && <span className="text-xs mt-1 px-2 bg-pink-100 text-pink-700 rounded-full">+ R$ {r.price}</span>}</button>); })}</div></section>
                <section><h3 className="text-lg font-bold text-[#4A3B32] mb-4">3. Cobertura</h3><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{coberturasOptions.map((c) => (<button key={c.name} onClick={() => setSelectedCobertura(c)} className={`p-3 rounded-xl border transition-all ${selectedCobertura?.name === c.name ? 'bg-[#4A3B32] text-white font-bold shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{c.name}</button>))}</div></section>
              </>
            )}
            {isDoce && (
              <section><div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200"><span className="text-3xl">🍬</span><div><h2 className="text-2xl font-serif font-bold text-[#4A3B32]">Escolha os Sabores</h2></div></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{docesOptions.map((doceName) => { const isSelected = selectedDoces.includes(doceName); return (<button key={doceName} onClick={() => handleToggleOption(doceName, selectedDoces, setSelectedDoces, false)} className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[80px] ${isSelected ? 'border-[#D48D92] bg-[#D48D92] text-white shadow-lg scale-95' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50'}`}>{isSelected && <div className="absolute top-2 right-2"><CheckCircle size={16} /></div>}<span className="font-bold text-center text-sm">{doceName}</span></button>); })}</div></section>
            )}
            <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl"><h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2"><Info size={20}/> Observações</h3><textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações..." className="w-full p-4 border border-gray-200 rounded-xl h-24 bg-white focus:outline-pink-300" /></section>
          </motion.div>
        )}

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="hidden md:block"><p className="text-xs text-gray-500 uppercase font-bold">Total Final</p><span className="text-3xl font-bold text-[#4A3B32]">R$ {calculateTotal().toFixed(2)}</span></div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end ml-auto">
                    <div className="flex items-center bg-gray-100 rounded-full p-1"><button onClick={() => updateQuantity(-1)} className="w-10 h-10 font-bold hover:bg-white rounded-full text-gray-600">-</button><span className="min-w-[40px] px-2 text-center font-bold text-lg">{quantity} {isDoce && <span className="text-xs font-normal">un</span>}</span><button onClick={() => updateQuantity(1)} className="w-10 h-10 font-bold hover:bg-white rounded-full text-gray-600">+</button></div>
                    <button onClick={handleAddToCart} disabled={!isFormValid && (!isDoce || selectedDoces.length <= maxSelections)} className={`flex-1 md:flex-none px-8 py-3 rounded-full text-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 ${isFormValid && (!isDoce || selectedDoces.length <= maxSelections) ? 'bg-[#4A3B32] hover:bg-[#3A2B22]' : 'bg-gray-300 cursor-not-allowed'}`}><ShoppingBag size={20} /> <span className="md:hidden">R$ {calculateTotal().toFixed(2)} • </span> <span>{isFormValid ? 'Adicionar' : 'Escolha Opções'}</span></button>
                </div>
            </div>
        </div>
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
