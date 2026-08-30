import api from "./axois.js";

export const getTopNews = async (page = 1, limit = 10) => {
  const response = await api.get("/news/top", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const getCategoryNews = async (category, page = 1, limit = 10) => {
  const response = await api.get("/news/category-news", {
    params: {
      category,
      page,
      limit,
    },
  });

  return response.data;
};
