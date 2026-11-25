import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useReservasStore } from './store/reservasStore';
import { useClientesStore } from './store/clientesStore';
import { useEstoqueStore } from './store/estoqueStore';
import { useFinanceiroStore } from './store/financeiroStore';
import { useEventosStore } from './store/eventosStore';
import { useUIStore } from './store/uiStore';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import DetalheReserva from './pages/DetalheReserva';
import Clientes from './pages/Clientes';
import Estoque from './pages/Estoque';
import Financeiro from './pages/Financeiro';
import Eventos from './pages/Eventos';
import Espacos from './pages/Espacos';
import ReservaPublica from './pages/ReservaPublica';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const initAuth = useAuthStore((s) => s.init);
  const initReservas = useReservasStore((s) => s.init);
  const initClientes = useClientesStore((s) => s.init);
  const initEstoque = useEstoqueStore((s) => s.init);
  const initFinanceiro = useFinanceiroStore((s) => s.init);
  const initEventos = useEventosStore((s) => s.init);
  const initNotificacoes = useUIStore((s) => s.initNotificacoes);

  useEffect(() => {
    initAuth();
    initReservas();
    initClientes();
    initEstoque();
    initFinanceiro();
    initEventos();
    initNotificacoes();
  }, [initAuth, initReservas, initClientes, initEstoque, initFinanceiro, initEventos, initNotificacoes]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reservar" element={<ReservaPublica />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
        <Route path="/reservas/:id" element={<ProtectedRoute><DetalheReserva /></ProtectedRoute>} />
        <Route path="/espacos" element={<ProtectedRoute><Espacos /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
        <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
