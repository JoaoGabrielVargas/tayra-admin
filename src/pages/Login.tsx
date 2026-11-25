import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, senha);
      if (ok) navigate('/');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex overflow-x-clip" style={{ background: 'linear-gradient(135deg, #1C3028 0%, #2D5240 60%, #4A7C5F 100%)' }}>
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative trees SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
          {[80,200,320,440,560].map((x,i) => (
            <g key={i} transform={`translate(${x}, ${100 + i*120})`}>
              <circle r={40+i*8} fill="#7FAF8D" opacity={0.6} />
              <circle r={28+i*5} cy={-10} fill="#4A7C5F" opacity={0.7} />
              <circle r={18+i*3} cy={-20} fill="#2D5240" opacity={0.8} />
              <rect x={-4} y={35} width={8} height={25} fill="#8A6B56" opacity={0.5} />
            </g>
          ))}
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-ambar-500 rounded-organic-lg flex items-center justify-center shadow-glow-ambar">
              <Leaf size={22} className="text-mata-900" />
            </div>
            <div>
              <p className="font-display text-white text-2xl font-semibold leading-tight">Tayra</p>
              <p className="text-mata-300 text-sm">Ecoparque</p>
            </div>
          </div>

          <h2 className="font-display text-white text-4xl font-semibold leading-snug mb-4">
            Bem-vindo de<br />volta à mata.
          </h2>
          <p className="text-mata-300 text-lg leading-relaxed max-w-sm">
            Sistema administrativo integrado para gestão de reservas, estoque e finanças do Tayra Ecoparque.
          </p>
        </div>

        <p className="relative z-10 text-mata-400 text-sm">
          © {new Date().getFullYear()} Tayra Ecoparque · Todos os direitos reservados
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-linho-100 lg:max-w-md w-full min-w-0">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-mata-700 rounded-organic flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display text-mata-900 text-xl font-semibold">Tayra</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-mata-900 text-2xl font-semibold mb-1">Entrar</h1>
            <p className="text-cedro-500 text-sm">Use suas credenciais de acesso.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
            <Input
              label="Senha"
              type={showSenha ? 'text' : 'password'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              suffix={
                <button type="button" onClick={() => setShowSenha(v => !v)} className="cursor-pointer">
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {error && (
              <div className="bg-barro-50 border border-barro-200 rounded-organic px-3 py-2">
                <p className="text-xs text-barro-700">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Entrar no sistema
            </Button>
          </form>

          <div className="mt-6 p-3 bg-linho-200 rounded-organic">
            <p className="text-xs text-cedro-500 font-semibold mb-1">Acesso demo</p>
            <p className="text-xs text-cedro-400">admin@tayra.com.br · <span className="font-mono">tayra2024</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
