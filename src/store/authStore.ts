import { create } from 'zustand';
import { storage } from '../utils/storage';
import type { User } from '../types';
import { USUARIOS_SEED } from '../data/seedData';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  init: () => {
    // Inicializa usuários se não existirem
    let usuarios = storage.getUsuarios();
    if (usuarios.length === 0) {
      storage.setUsuarios(USUARIOS_SEED);
      usuarios = USUARIOS_SEED;
    }
    // Restaura sessão
    const saved = storage.getAuthUser();
    if (saved) set({ user: saved });
  },

  login: (email, senha) => {
    const usuarios = storage.getUsuarios();
    const found = usuarios.find(u => u.email === email && u.senha === senha);
    if (found) {
      storage.setAuthUser(found);
      set({ user: found, error: null });
      return true;
    }
    set({ error: 'E-mail ou senha incorretos.' });
    return false;
  },

  logout: () => {
    storage.setAuthUser(null);
    set({ user: null });
  },
}));
