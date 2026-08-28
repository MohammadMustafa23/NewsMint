import api from "./axois.js";

export const getTelegramConnectUrl = async () => {
  const response = await api.get("/telegram/connect", {
    withCredentials: true,
  });

  return response.data;
};

export const getTelegramStatus = async (signal) => {
  const response = await api.get("/telegram/status", {
    withCredentials: true,
    signal,
  });

  return response.data;
};

export const connectTelegram = async ({
  onConnected,
  onTimeout,
  timeout = 2 * 60 * 1000,
  interval = 2000,
  signal,
}) => {
  // Already cancelled before starting
  if (signal?.aborted) {
    return;
  }

  const response = await getTelegramConnectUrl();

  // Component/service cancelled while getting URL
  if (signal?.aborted) {
    return;
  }

  const telegramUrl = response?.telegramUrl;

  if (!telegramUrl) {
    throw new Error("Telegram connection URL was not generated.");
  }

  window.open(telegramUrl, "_blank", "noopener,noreferrer");

  const startTime = Date.now();

  let timeoutId = null;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const check = async () => {
    // Stop polling if cancelled
    if (signal?.aborted) {
      cleanup();
      return;
    }

    try {
      const status = await getTelegramStatus(signal);

      // Request may have completed after cancellation
      if (signal?.aborted) {
        cleanup();
        return;
      }

      if (status?.connected) {
        cleanup();
        onConnected?.(status);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        cleanup();
        onTimeout?.();
        return;
      }

      timeoutId = setTimeout(check, interval);
    } catch (error) {
      // AbortController cancellation is expected
      if (signal?.aborted) {
        cleanup();
        return;
      }

      console.error("Telegram status check failed:", error);

      // Continue polling for normal request errors
      timeoutId = setTimeout(check, interval);
    }
  };

  // Cleanup polling when AbortController is triggered
  signal?.addEventListener("abort", cleanup, {
    once: true,
  });

  timeoutId = setTimeout(check, interval);
};
