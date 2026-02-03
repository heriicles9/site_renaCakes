import { Cake } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-brown text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cake size={28} />
              <h3 className="font-heading text-2xl font-bold">Renaildes Cakes</h3>
            </div>
            <p className="text-white/80">
              Bolos artesanais e doces finos para tornar suas celebrações ainda mais especiais.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">Contato</h4>
            <p className="text-white/80 mb-2">WhatsApp: (75) 98177-7873</p>
            <p className="text-white/80">renaildes_cakes</p>
          </div>

          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">Horário</h4>
            <p className="text-white/80">Segunda a Sábado</p>
            <p className="text-white/80">8h - 18h</p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/60">
          <p>© 2026 Renaildes Cakes. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
