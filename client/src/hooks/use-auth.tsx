import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

// Gestión simple del estado de autenticación usando localStorage
function getAuthState(): AuthState {
  try {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  } catch {
    return { token: null, user: null };
  }
}

function setAuthState(token: string, user: User) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function clearAuthState() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function useAuth() {
  const [authState, setAuthStateLocal] = useState<AuthState>(getAuthState);

  // Query para validar el token con el servidor
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/usuario"],
    enabled: !!authState.token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Si hay error 401/403, limpiar el estado local
  useEffect(() => {
    if (error && (error.message.includes('401') || error.message.includes('403'))) {
      clearAuthState();
      setAuthStateLocal({ token: null, user: null });
    }
  }, [error]);

  // Actualizar el estado local cuando obtenemos datos del servidor
  useEffect(() => {
    if (user && authState.token) {
      setAuthStateLocal({ token: authState.token, user: user as User });
    }
  }, [user, authState.token]);

  const login = (token: string, userData: User) => {
    setAuthState(token, userData);
    setAuthStateLocal({ token, user: userData });
  };

  const logout = () => {
    clearAuthState();
    setAuthStateLocal({ token: null, user: null });
    window.location.href = '/';
  };

  return {
    user: user || authState.user,
    token: authState.token,
    isLoading: isLoading && !!authState.token,
    isAuthenticated: !!(user || authState.user),
    login,
    logout,
  };
}
