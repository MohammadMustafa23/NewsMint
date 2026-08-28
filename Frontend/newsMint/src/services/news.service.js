import api from "./axois.js";

export const getMyNews = async (page = 1, limit = 10) => {
  const response = await api.get(`/news/my-news?page=${page}&limit=${limit}`);
  return response.data;
};
