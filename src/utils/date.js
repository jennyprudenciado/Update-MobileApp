export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
};

export const getNextWateringDate = (plant) => {
  return addDays(plant.lastWatered, plant.interval);
};

export const getDaysDifference = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export const getWateringStatus = (plant) => {
  const difference = getDaysDifference(getNextWateringDate(plant));

  if (difference < 0) return "Overdue";
  if (difference === 0) return "Due Today";
  if (difference === 1) return "Due Tomorrow";

  return `Due in ${difference} days`;
};