const MAX_TELEGRAM_LENGTH = 4000;

export const splitTelegramMessage = (
  message,
  maxLength = MAX_TELEGRAM_LENGTH,
) => {
  if (!message) {
    return [];
  }

  if (message.length <= maxLength) {
    return [message];
  }

  const sections = message.split("\n━━━━━━━━━━━━━━\n");

  const chunks = [];
  let currentChunk = "";

  for (const section of sections) {
    const cleanSection = section.trim();

    if (!cleanSection) {
      continue;
    }

    const candidate = currentChunk
      ? `${currentChunk}\n━━━━━━━━━━━━━━\n${cleanSection}`
      : cleanSection;

    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    if (cleanSection.length <= maxLength) {
      currentChunk = cleanSection;
      continue;
    }

    const lines = cleanSection.split("\n");
    let lineChunk = "";

    for (const line of lines) {
      const candidateLine = lineChunk ? `${lineChunk}\n${line}` : line;

      if (candidateLine.length <= maxLength) {
        lineChunk = candidateLine;
        continue;
      }

      if (lineChunk) {
        chunks.push(lineChunk);
        lineChunk = "";
      }

      if (line.length <= maxLength) {
        lineChunk = line;
      } else {
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      }
    }

    if (lineChunk) {
      currentChunk = lineChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};
