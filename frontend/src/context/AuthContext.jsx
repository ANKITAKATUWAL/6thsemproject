import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        // Assuming we have an endpoint to get current user
        const response = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
        setUser(response.data.user);
      } catch (err) {
        console.error("Auth check error:", err);
        Cookies.remove('token');
      }
    }
    setLoading(false);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};