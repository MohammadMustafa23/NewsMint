import api from "./axois.js";

export const registerUser = async (data) => {
  return await api.post("/auth/register", data);
};

export const verifyEmail = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const loginwithGoogle = async (data) => {
  const response = await api.post("/auth/google", data);
  return response.data;
};

export const forgetPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const VerifyResetOTP = async (data) => {
  const response = await api.post("/auth/verify-reset-otp", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const resendOTP = async (data) => {
  const response = await api.post('/auth/resend-otp',data);
  return response.data;
}

