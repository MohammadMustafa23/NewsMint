import api from "./axois.js";

export const getMyNews = async () => {
  const response = await api.get("/news/my-news");
  return response.data;
};
