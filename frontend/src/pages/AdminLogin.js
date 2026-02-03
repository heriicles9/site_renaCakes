import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      localStorage.setItem('admin_token', response.data.access_token);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1583067784891-36831dbd4cb4?crop=entropy&cs=srgb&fm=jpg&q=85)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-brand-cream/90"></div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-brand-pink/20"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-brand-brown mb-2" data-testid="admin-login-heading">
            Área Administrativa
          </h1>
          <p className="text-brand-brown/70">Renaildes Cakes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-brand-brown font-semibold mb-2">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/50" size={20} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors"
                placeholder="Digite seu usuário"
                required
                data-testid="admin-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-brown font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/50" size={20} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-brand-pink/50 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-colors"
                placeholder="Digite sua senha"
                required
                data-testid="admin-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-white py-4 rounded-full text-lg font-semibold hover:bg-brand-brown/90 shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="admin-login-button"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-brand-brown/70 hover:text-brand-brown transition-colors font-medium"
            data-testid="back-to-site-button"
          >
            Voltar para o site
          </button>
        </div>

        <div className="mt-8 p-4 bg-brand-pink/30 rounded-lg">
          <p className="text-xs text-brand-brown/70 text-center">
            <strong>Demo:</strong> Usuário: admin | Senha: admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
