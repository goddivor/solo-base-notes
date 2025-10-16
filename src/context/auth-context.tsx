import React, { useState, type ReactNode } from 'react';
import { gql, useQuery } from '@apollo/client';
import { AuthContext } from '../lib/auth-context-def';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      avatar
    }
  }
`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const { data, loading, refetch } = useQuery(ME_QUERY, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  const user = data?.me || null;
  const isAuthenticated = !!user;

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

