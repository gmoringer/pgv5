import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { signIn as sendSignInRequest } from "../api/auth";
import { firebase, auth } from "../firebase";

function AuthProvider(props) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    firebase.auth.onAuthStateChanged((usr) => {
      if (usr) {
        setUser(usr);
      }
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await sendSignInRequest(email, password);
    if (result.isOk) {
      setUser(result.data);
    }

    return result;
  }, []);

  const signOut = useCallback(() => {
    setUser();
    auth.doSignOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, loading }}
      {...props}
    />
  );
}

const AuthContext = createContext({});
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
