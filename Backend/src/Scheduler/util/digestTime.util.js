import { DateTime } from "luxon";

export const getNextDeliveryAt = (deliveryTime, timezone = "Asia/Kolkata") => {
  if (!deliveryTime) {
    throw new Error("Delivery time is required.");
  }

  // "07:30 AM (IST)" → "07:30 AM"
  const cleanTime = deliveryTime.replace(/\s*\([^)]*\)/, "").trim();

  const now = DateTime.now().setZone(timezone);

  let nextDelivery = DateTime.fromFormat(
    `${now.toFormat("yyyy-MM-dd")} ${cleanTime}`,
    "yyyy-MM-dd hh:mm a",
    {
      zone: timezone,
    },
  );

  if (!nextDelivery.isValid) {
    throw new Error(`Invalid delivery time: ${deliveryTime}`);
  }

  // Today's delivery time has already passed
  if (nextDelivery <= now) {
    nextDelivery = nextDelivery.plus({
      days: 1,
    });
  }

  return nextDelivery.toUTC().toJSDate();
};
