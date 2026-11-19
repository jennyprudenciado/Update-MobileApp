import { addDays } from "../utils/date";

export const initialPlants = [
  {
    id: "1",
    name: "Monstera",
    type: "Indoor Plant",
    interval: 2,
    lastWatered: new Date(),
    image: require("../assets/monstera.jpg"),
  },
  {
    id: "2",
    name: "Snake Plant",
    type: "Low-Light Plant",
    interval: 3,
    lastWatered: addDays(new Date(), -3),
    image: require("../assets/snake-plant.jpg"),
  },
  {
    id: "3",
    name: "Peace Lily",
    type: "Flowering Plant",
    interval: 1,
    lastWatered: addDays(new Date(), -2),
    image: require("../assets/peace-lily.jpg"),
  },
  {
    id: "4",
    name: "Roses",
    type: "Flowering Plant",
    interval: 3,
    lastWatered: addDays(new Date(), -3),
    image: require("../assets/rose.jpg")

  },
];

export const initialDiary = [
  {
    id: "1",
    plantName: "Monstera",
    note: "New leaves are starting to grow!",
    date: new Date(),
    image: require("../assets/monstera.jpg"),
  },
  {
    id: "2",
    plantName: "Snake Plant",
    note: "The leaves look healthy after watering.",
    date: addDays(new Date(), -2),
    image: require("../assets/snake-plant.jpg")
  },
];