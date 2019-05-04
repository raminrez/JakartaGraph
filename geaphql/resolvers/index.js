const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });

    return events;
  } catch (error) {
    throw error;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator)
    };
  } catch (error) {
    throw error;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (error) {
      throw error;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          event: singleEvent.bind(this, booking._doc.event),
          user: user.bind(this, booking._doc.user),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.createdAt).toISOString()
        };
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
      createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString()
      };
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

    // return event;
  },
  createUser: async ({ userInput }) => {
    try {
      const existingUser = await User.findOne({ email: userInput.email });
      if (existingUser) {
        throw new Error("User exists already.");
      }
      const hashedPassword = await bcrypt.hash(userInput.password, 12);

      const user = new User({
        email: userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5cc6d7d89515ca0788a6ec19",
      event: fetchedEvent
    });

    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      event: singleEvent.bind(this, booking._doc.event),
      user: user.bind(this, booking._doc.user),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.createdAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  }
};
