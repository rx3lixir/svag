import { eventsApi } from "$lib";

export const load = async () => {
  try {
    const events = await eventsApi.getAll();
    return { events };
  } catch (error) {
    console.error("Failed to load events:", error);
    return {
      events: [],
    };
  }
};
