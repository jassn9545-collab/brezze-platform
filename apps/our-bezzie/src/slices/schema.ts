import { Job } from "./types";


export const updateItemById = (
    jobs: Job[],
    id: number,
    updater: (j: Job) => void
  ) => {
    const product = jobs.find(j => j.id === id);
    if (product) {
      updater(product);
    }
  };