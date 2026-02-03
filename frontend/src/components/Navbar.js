import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getItemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-brand-pink/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-heading text-2xl md:text-3xl font-bold text-brand-brown">
            Renaildes Cakes
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-brand-brown hover:text-brand-rose transition-colors font-medium"
            >
              Início
            </Link>
            <Link
              to="/catalogo"
              className="text-brand-brown hover:text-brand-rose transition-colors font-medium"
            >
              Catálogo
            </Link>
            <Link
              to="/checkout"
              className="relative flex items-center gap-2 bg-brand-brown text-white px-6 py-2.5 rounded-full hover:bg-brand-brown/90 transition-all transform active:scale-95"
              data-testid="navbar-cart-button"
            >
              <ShoppingBag size={20} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-rose text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden text-brand-brown"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-brand-pink/20"
          >
            <div className="px-6 py-4 space-y-4">
              <Link
                to="/"
                className="block text-brand-brown hover:text-brand-rose transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/catalogo"
                className="block text-brand-brown hover:text-brand-rose transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                to="/checkout"
                className="flex items-center gap-2 bg-brand-brown text-white px-6 py-2.5 rounded-full hover:bg-brand-brown/90 transition-all w-fit"
                onClick={() => setIsOpen(false)}
                data-testid="mobile-cart-button"
              >
                <ShoppingBag size={20} />
                Carrinho ({getItemCount()})
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
