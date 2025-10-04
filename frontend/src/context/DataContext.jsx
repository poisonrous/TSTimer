import React, { createContext, useState, useEffect, useCallback } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {

  const SERVER = import.meta.env.VITE_SERVER_URL;  

  const [statsData, setStatsData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState({ stats: true, user: true, faqs: true, users: true });
  const [users, setUsers] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const fetchStatsData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    try {
      const response = await fetch(`/api/stats?period=Last 4 weeks`);
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    console.log("fetching user data");
    setLoading((prev) => ({ ...prev, user: true }));
    try {
      const response = await fetch(`${SERVER}/api/user`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const response = await fetch(`${SERVER}/api/users`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      const activeUsers = data.filter(user => !user.deletedAt);
      setUsers(activeUsers);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, faqs: true }));
    try {
      const response = await fetch(`${SERVER}/api/faqs`);
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error al obtener preguntas frecuentes:', error);
    } finally {
      setLoading((prev) => ({ ...prev, faqs: false }));
    }
  }, []);

  const handleSaveFaq = async (id, newQuestion, newAnswer) => {
    try {
      const response = await fetch(id ? `${SERVER}/api/faqs/${id}` : 'http://localhost:5000/api/faqs', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer })
      });

      const updatedFaq = await response.json();
      if (id) {
        setFaqs(faqs.map(q => (q._id === id ? updatedFaq : q)));
      } else {
        setFaqs([updatedFaq, ...faqs]);
      }
    } catch (error) {
      console.error(`Error al ${id ? 'actualizar' : 'crear'} la pregunta:`, error);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await fetch(`${SERVER}/api/faqs/${id}/delete`, {
        method: 'PUT'
      });
      setFaqs(faqs.filter(q => q._id !== id));
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error);
    }
  };

  const handleToggleFaqVisibility = async (id, currentVisibility) => {
    try {
      const response = await fetch(`${SERVER}/api/faqs/${id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visible: !currentVisibility })
      });
      const updatedFaq = await response.json();
      setFaqs(faqs.map(q => (q._id === id ? updatedFaq : q)));
    } catch (error) {
      console.error('Error al cambiar la visibilidad de la pregunta:', error);
    }
  };

  const handleSaveAccess = async (userId, access) => {
    try {
      const response = await fetch(`${SERVER}/api/users/${userId}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access }),
        credentials: 'include',
      });
      const updatedUser = await response.json();
      setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
    } catch (error) {
      console.error('Error al actualizar acceso del usuario:', error);
    }
  };

  const handleDeleteUser = async (userId, password) => {
    try {
      const response = await fetch(`${SERVER}/api/users/${userId}/delete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al borrar lógicamente el usuario');
      }

      // Marcar el usuario como eliminado en el estado local
      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === updatedUser.user._id ? updatedUser.user : u));
      console.log('Usuario borrado lógicamente con éxito:', userId);
    } catch (error) {
      console.error('Error al borrar lógicamente el usuario:', error);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const response = await fetch(`${SERVER}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar el usuario');
      }

      const addedUser = await response.json();
      setUsers([...users, addedUser]);
      return addedUser;
    } catch (error) {
      console.error('Error al agregar el usuario:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStatsData();
    fetchUserData();
    fetchUsers();
    fetchFaqs();
  }, [fetchStatsData, fetchUserData, fetchUsers, fetchFaqs]);

  return (
      <DataContext.Provider value={{
        statsData,
        userData,
        users,
        faqs,
        loading,
        fetchStatsData,
        fetchUserData,
        fetchUsers,
        fetchFaqs,
        handleSaveFaq,
        handleDeleteFaq,
        handleToggleFaqVisibility,
        handleSaveAccess,
        handleDeleteUser,
        handleAddUser
      }}>
        {children}
      </DataContext.Provider>
  );
};
