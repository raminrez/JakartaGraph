const Event = require("../../models/event");
const User = require("../../models/user");

const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async ({ eventInput }) => {
    const event = new Event({
      title: eventInput.title,
      description: eventInput.description,
      date: new Date().toISOString(),
      price: +eventInput.price,
      creator: "5cc6d7d89515ca0788a6ec19"
    });
    let createdEvent;

    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById("5cc6d7d89515ca0788a6ec19");

      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (error) {
      throw error;
    }
  }
};
