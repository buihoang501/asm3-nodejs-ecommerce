//Session Model
const Session = require("../models/Session");

const handleChatIO = async (socket, io) => {
  //On message event
  socket.on("message", async (data) => {
    if (data.action === "client-end") {
      io.emit("message", {
        action: "server-send-end",
        message: "Your session chat ended!",
        _id: data._id,
      });
      await Session.findByIdAndDelete(data._id);
    }

    //Admin message
    if (data.action === "admin-send") {
      io.emit("message", {
        action: "server-send",
        message: data.message,
        client: data.client,
        _id: data._id,
      });

      const session = await Session.findById(data._id);

      const updatedMessages = [
        ...session.messages,
        {
          message: data.message,
          client: data.client,
        },
      ];
      session.messages = updatedMessages;

      //Save session to database
      await session.save();
    }

    //Client message
    if (data.action === "client-send") {
      if (data?.first) {
        const session = await Session({
          messages: [
            {
              message: data.message,
              client: data.client,
            },
          ],
        });
        io.emit("message", {
          action: "server-send",
          message: data.message,
          client: data.client,
          _id: session._id,
        });

        //Save session to database
        await session.save();
      } else {
        const session = await Session.findById(data._id);

        const updatedMessages = [
          ...session.messages,
          {
            message: data.message,
            client: data.client,
          },
        ];
        session.messages = updatedMessages;

        io.emit("message", {
          action: "server-send",
          message: data.message,
          client: data.client,
          _id: data._id,
        });
        //Save session to database
        await session.save();
      }
    }
  });
};

module.exports = handleChatIO;
