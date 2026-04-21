
import api from "../../../api/axios";

export const loginService = (email: string, password: string) => {
  return api.post("/login", { email, password });
};

export const profileService = () => {
  return api.get("/me");
};

export const logoutService = () => {
  return api.post("/logout");
};

export const registerService = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return api.post("/register", data);
};