import api from "./axois.js";

export const getTelegramConnectUrl = async () => {
  const response = await api.get("/telegram/connect", {
    withCredentials: true,
  });

  return response.data;
};

export const getTelegramStatus = async () => {
  const response = await api.get("/telegram/status", {
    withCredentials: true,
  });

  return response.data;
};

export const connectTelegram = async ({
  onConnected,
  onTimeout,
  timeout = 2 * 60 * 1000,
  interval = 2000,
}) => {
  const response = await getTelegramConnectUrl();

  const telegramUrl = response?.telegramUrl;

  if (!telegramUrl) {
    throw new Error("Telegram connection URL was not generated.");
  }

  window.open(telegramUrl, "_blank", "noopener,noreferrer");

  const startTime = Date.now();

  const check = async () => {
    const status = await getTelegramStatus();

    if (status?.connected) {
      onConnected?.(status);
      return;
    }

    if (Date.now() - startTime >= timeout) {
      onTimeout?.();
      return;
    }

    setTimeout(check, interval);
  };

  setTimeout(check, interval);
};
