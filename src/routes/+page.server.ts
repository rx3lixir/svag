import { eventsApi } from "$lib";

export const load = async () => {
  try {
    const eventsResponse = await eventsApi.getAll();

    return {
      events: eventsResponse.events,
      pagination: eventsResponse.pagination,
    };
  } catch (error) {
    console.error("Failed to load events:", error);
    return {
      events: [],
      paginaion: null,
    };
  }
};
