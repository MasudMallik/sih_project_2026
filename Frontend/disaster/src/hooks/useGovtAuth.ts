import { useState, useEffect } from "react";
import {
  getGovtUser,
  setGovtToken,
  removeGovtToken,
  type GovtUser,
} from "../services/govtAuth.service";

export const useGovtAuth = () => {
  const [user, setUser] = useState<GovtUser | null>(null);

  useEffect(() => {
    setUser(getGovtUser());
  }, []);

  const login = (jwt: string) => {
    setGovtToken(jwt);
    setUser(getGovtUser());
  };

  const logout = () => {
    removeGovtToken();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return { user, isAuthenticated, login, logout };
};
