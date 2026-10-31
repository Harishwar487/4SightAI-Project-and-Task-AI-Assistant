
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loginUser,
  getCurrentUser,
  logoutUser
} from "../services/authAPI";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem(
          "current_user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    await loginUser(email, password);

    const currentUser = await getCurrentUser();

    setUser(currentUser);

    localStorage.setItem(
      "current_user",
      JSON.stringify(currentUser)
    );

    return currentUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
