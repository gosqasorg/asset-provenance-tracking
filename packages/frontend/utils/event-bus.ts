import mitt, { Emitter } from 'mitt';

// Define the events for type safety
interface Events {
  feedRefresh: void;
  // Add other events here
}

// Create the event bus
export const EventBus: Emitter<Events> = mitt();
