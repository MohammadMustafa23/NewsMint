import api from "./axois.js";

export const getAllSources = async () => {
  const response = await api.get("/sources/all-sources");
  return response.data;
};

export const getMySources = async () => {
  const response = await api.get("/sources/my-sources");
  return response.data;
};

export const addSource = async (sourceId) => {
  const response = await api.post("/sources/select", {
    sourceId,
  });

  return response.data;
};

export const removeSource = async (sourceId) => {
  const response = await api.delete(
    `/sources/select/${sourceId}`,
  );

  return response.data;
};