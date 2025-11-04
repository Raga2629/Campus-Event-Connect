import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Student {
  id: string;
  roll_no: string;
  name: string;
  dept: string;
  year: number;
  email: string;
  attendance_percentage: number;
}

interface Organizer {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: Student | Organizer | null;
  userRole: 'student' | 'organizer' | null;
  login: (user: Student | Organizer, role: 'student' | 'organizer') => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | Organizer | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'organizer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');

    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedRole as 'student' | 'organizer');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: Student | Organizer, role: 'student' | 'organizer') => {
    setUser(userData);
    setUserRole(role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
