const express = require("express");
const { createServer } = require("node:http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(
  "mongodb+srv://ppmbjr:12KSV3cCxdvBBV5S@cluster0.f4pus.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

const PORT = 3000;

const app = express();
app.use(express.json());

const server = createServer(app);

app.use(cors());

var collection;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/status", (req, res) => {
  res.send("<h1>API is running</h1>");
});

app.get("/conversation", async (request, response) => {
  const { roomID } = request.query;

  try {
    // Find the documents matching the query
    const result = await collection.findOne({ _id: new ObjectId(roomID) });

    // Send the documents as the response
    response.status(200).json(result);
  } catch (e) {
    // Handle any errors and send a 500 response with the error message
    response.status(500).send({ message: e.message });
  }
});

app.get("/conversations", async (request, response) => {
  const { origin } = request.query;

  try {
    // Find the documents matching the query
    const result = await collection
      .find({
        $or: [{ origin: origin }, { destination: origin }],
      })
      .toArray();

    // Send the documents as the response
    response.status(200).json(result);
  } catch (e) {
    // Handle any errors and send a 500 response with the error message
    response.status(500).send({ message: e.message });
  }
});

//Connection event listener
io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("join-conversation", async (origin, destination) => {
    try {
      let result = await collection.findOne({
        $or: [
          { origin: origin, destination: destination },
          { origin: destination, destination: origin },
        ],
      });

      if (!result?._id) {
        result = await collection.insertOne({
          origin: origin,
          destination: destination,
          messages: [],
        });

        console.log(
          "Creating new conversation with id: ",
          result.insertedId.toString()
        );
      }

      const roomID = result?._id || result?.insertedId?.toString?.();
      socket.join(roomID);
      socket.activeRoom = roomID;

      console.log(
        `Origin: ${origin}, Destination: ${destination} joined conversation with roomID: ${roomID}`
      );

      // Notify the client that they have joined
      socket.emit("join-conversation", roomID);
    } catch (e) {
      console.error(e);
      socket.emit("error", { message: e.message });
    }
  });

  socket.on("leave-room", async (roomID) => {
    console.log(`Leaving room: ${roomID}`);

    await socket.leave(roomID);
  });

  socket.on("join-all-chats", async (origin) => {
    try {
      const result = await collection
        .find({
          $or: [{ origin: origin }, { destination: origin }],
        })
        .toArray();

      const roomID = `${origin}-chats`;
      socket.join(roomID);
      socket.activeRoom = roomID;

      socket.emit("join-all-chats", result);
    } catch (e) {
      console.error(e);
      socket.emit("error", { message: e.message });
    }
  });

  // Message event listener
  socket.on("message", ({ message, documentID }) => {
    // Push the new message to the database for the active room
    console.log(`Message: ${message.text} sent on room: ${socket.activeRoom}`);

    collection.updateOne(
      { _id: new ObjectId(documentID) },
      {
        $push: {
          messages: message,
        },
      }
    );
    // Broadcast the new message to all users in the room
    io.to(socket.activeRoom).emit("message", message);
  });

  // Disconnect event listener
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

server.listen(PORT, async () => {
  try {
    await client.connect();
    collection = client.db("chat-message").collection("chats");
    console.log(`Listening on port: ${PORT}`);
  } catch (e) {
    console.error(e);
  }
});
