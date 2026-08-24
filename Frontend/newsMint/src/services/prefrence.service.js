import api from "./axois.js";

export const savePreferences = async (data) => {
  const response = await api.post("/preferences/save-preferences", data);
  return response.data;
};

export const getMyPreferences = async () => {
  const response = await api.get("/preferences/dashboard");
  return response.data;
};

export const checkMyPreferences = async () => {
  const response = await api.get("/preferences/me");
  return response.data;
};

export const updatePreferences = async (preferenceData) => {
  const response = await api.put("/preferences/update-preferences", preferenceData);
  return response.data;
};
