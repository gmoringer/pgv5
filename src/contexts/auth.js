import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { signIn as sendSignInRequest } from "../api/auth";
import { firebase, auth, db } from "../firebase";

function AuthProvider(props) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    firebase.auth.onAuthStateChanged((usr) => {
      if (usr) {
        db.getOneUser(usr.uid).then((user) => {
          const isAdmin = user.data().isAdmin ? true : false;
          const editVendorlist = user.data().vendorlist
            ? user.data().vendorlist
            : false;

          const editWorkers = user.data().isWorkers
            ? user.data().isWorkers
            : false;
          const newUser = {
            ...user.data(),
            isAdmin: isAdmin,
            okWorkers: editWorkers,
            uid: usr.uid,
            vendorlist: editVendorlist,
          };
          setUser(newUser);
        });
      }
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await sendSignInRequest(email, password);
    if (result.isOk) {
      await db.getOneUser(result.data.uid).then((user) => {
        const isAdmin = user.data().isAdmin ? true : false;
        const isExport = user.data().isExport ? true : false;
        const newUser = {
          ...user.data(),
          isAdmin: isAdmin,
          isExport: isExport,
          uid: result.data.uid,
        };
        setUser(newUser);
      });
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
