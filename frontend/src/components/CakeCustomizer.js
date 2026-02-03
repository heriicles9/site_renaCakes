import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const CakeCustomizer = ({ product, onCustomizationChange }) => {
  const [customization, setCustomization] = useState({
    massa: '',
    recheio: '',
    cobertura: 'Chantilly',
    observacoes: ''
  });

  const massasDisponiveis = [
    { nome: 'Tradicional', preco: 0 },
    { nome: 'Baunilha', preco: 0 },
    { nome: 'Chocolate', preco: 0 },
    { nome: 'Coco', preco: 0 },
    { nome: 'Red Velvet', preco: 10, especial: true },
    { nome: 'Black', preco: 10, especial: true },
    { nome: 'Nozes', preco: 15, especial: true },
    { nome: 'Amendoim', preco: 10, especial: true }
  ];

  const recheiosDisponiveis = [
    { nome: 'Chocolate Belga', preco: 0 },
    { nome: 'Quatro Leites', preco: 0 },
    { nome: 'Brigadeiro Branco', preco: 0 },
    { nome: 'Beijinho', preco: 0 },
    { nome: 'Limão Siciliano', preco: 0 },
    { nome: 'Mousse Flocado', preco: 5 },
    { nome: 'Mousse de Maracujá', preco: 5 },
    { nome: 'Doce de Leite', preco: 0 },
    { nome: 'Ameixa', preco: 0 },
    { nome: 'Nozes', preco: 15, especial: true },
    { nome: 'Damasco', preco: 12, especial: true },
    { nome: 'Pistache', preco: 20, especial: true },
    { nome: 'Amêndoas', preco: 15, especial: true },
    { nome: 'Geleia Frutas Vermelhas', preco: 8, especial: true },
    { nome: 'Geleia Morango Fresco', preco: 10, especial: true },
    { nome: 'Nutella', preco: 25, especial: true },
    { nome: 'Abacaxi c/ Coco', preco: 8 }
  ];

  const coberturasDisponiveis = [
    { nome: 'Chantilly', preco: 0 },
    { nome: 'Ganache', preco: 5 },
    { nome: 'Buttercream', preco: 8 },
    { nome: 'Glacê', preco: 3 },
    { nome: 'Pasta Americana', preco: 15 }
  ];

  const handleChange = (field, value) => {
    const newCustomization = { ...customization, [field]: value };
    setCustomization(newCustomization);
    
    const massaSelecionada = massasDisponiveis.find(m => m.nome === newCustomization.massa);
    const recheioSelecionado = recheiosDisponiveis.find(r => r.nome === newCustomization.recheio);
    const coberturaSelecionada = coberturasDisponiveis.find(c => c.nome === newCustomization.cobertura);
    
    const precoAdicional = 
      (massaSelecionada?.preco || 0) + 
      (recheioSelecionado?.preco || 0) + 
      (coberturaSelecionada?.preco || 0);
    
    onCustomizationChange({
      ...newCustomization,
      precoAdicional,
      isComplete: newCustomization.massa && newCustomization.recheio
    });
  };

  if (product.category !== 'Bolos Redondos' && product.category !== 'Bolos Retangulares') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-pink/20 rounded-2xl p-6 mb-8"
    >
      <h3 className="font-heading text-2xl font-bold text-brand-brown mb-6">
        🎂 Monte Seu Bolo Personalizado
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-brand-brown font-semibold mb-3">
            Escolha a Massa *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {massasDisponiveis.map((massa) => (
              <button
                key={massa.nome}
                onClick={() => handleChange('massa', massa.nome)}
                className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  customization.massa === massa.nome
                    ? 'border-brand-brown bg-brand-brown text-white shadow-lg'
                    : 'border-brand-pink/50 bg-white text-brand-brown hover:border-brand-brown/50'
                }`}
                data-testid={`massa-${massa.nome.toLowerCase().replace(/ /g, '-')}`}
              >
                {customization.massa === massa.nome && (
                  <Check className="absolute top-2 right-2" size={18} />
                )}
                <div className="font-semibold text-sm mb-1">{massa.nome}</div>
                {massa.preco > 0 && (
                  <div className="text-xs">
                    +R$ {massa.preco.toFixed(2)}
                  </div>
                )}
                {massa.especial && (
                  <span className="text-xs bg-brand-rose px-2 py-0.5 rounded-full">
                    Especial
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-brand-brown font-semibold mb-3">
            Escolha o Recheio *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recheiosDisponiveis.map((recheio) => (
              <button
                key={recheio.nome}
                onClick={() => handleChange('recheio', recheio.nome)}
                className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  customization.recheio === recheio.nome
                    ? 'border-brand-brown bg-brand-brown text-white shadow-lg'
                    : 'border-brand-pink/50 bg-white text-brand-brown hover:border-brand-brown/50'
                }`}
                data-testid={`recheio-${recheio.nome.toLowerCase().replace(/ /g, '-')}`}
              >
                {customization.recheio === recheio.nome && (
                  <Check className="absolute top-2 right-2" size={18} />
                )}
                <div className="font-semibold text-sm mb-1">{recheio.nome}</div>
                {recheio.preco > 0 && (
                  <div className="text-xs">
                    +R$ {recheio.preco.toFixed(2)}
                  </div>
                )}
                {recheio.especial && (
                  <span className="text-xs bg-brand-rose px-2 py-0.5 rounded-full">
                    Especial
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-brand-brown font-semibold mb-3">
            Escolha a Cobertura
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {coberturasDisponiveis.map((cobertura) => (
              <button
                key={cobertura.nome}
                onClick={() => handleChange('cobertura', cobertura.nome)}
                className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  customization.cobertura === cobertura.nome
                    ? 'border-brand-brown bg-brand-brown text-white shadow-lg'
                    : 'border-brand-pink/50 bg-white text-brand-brown hover:border-brand-brown/50'
                }`}
                data-testid={`cobertura-${cobertura.nome.toLowerCase().replace(/ /g, '-')}`}
              >
                {customization.cobertura === cobertura.nome && (
                  <Check className="absolute top-2 right-2" size={18} />
                )}
                <div className="font-semibold text-sm mb-1">{cobertura.nome}</div>
                {cobertura.preco > 0 && (
                  <div className="text-xs">
                    +R$ {cobertura.preco.toFixed(2)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-brand-brown font-semibold mb-2">
            Observações Especiais
          </label>
          <textarea
            value={customization.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors"
            placeholder="Ex: Escrever 'Parabéns Maria' no topo, sem glacê..."
            rows="3"
            data-testid="observacoes-input"
          />
        </div>

        {!customization.massa || !customization.recheio ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Por favor, selecione uma massa e um recheio para continuar
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              ✓ Seu bolo personalizado está pronto!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CakeCustomizer;
