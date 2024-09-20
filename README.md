# Real-Time Chat Application with MongoDB, AWS S3, and Socket.IO

This project is a Node.js-based chat application with real-time messaging using **Socket.IO** and data storage using **MongoDB**. It also supports image uploads, storing them in **AWS S3** and saving the URLs in the MongoDB database.

## Features

- **Real-time messaging** with Socket.IO.
- **MongoDB** for storing conversations and messages.
- **AWS S3** for storing and retrieving images.
- **REST API** for fetching conversations and uploading images.
- **Socket.IO** to handle room-based communication between users.
- **Multer** to handle image uploads from users.
- **CORS support** for cross-origin requests.

## Setup

### Environment Variables

Create a `.env` file in the root of your project and add the following:

```bash
MONGODB_URL=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
Installation
Clone this repository:
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

The server will start running on http://localhost:3000.

## Endpoints
**GET /status**
Returns a simple HTML page to confirm that the API is running.

```html
<h1>API is running</h1>
```

**GET /conversation**
Fetches a conversation based on the roomID (MongoDB ObjectId).

**Query Parameters:**

roomID: The ID of the chat room to retrieve.

**GET /conversations**
Fetches all conversations involving the specified user.

**Query Parameters:**

origin: The origin user for fetching conversations.

**POST /upload**
Uploads an image to AWS S3 and stores the image URL in the MongoDB collection under a specific conversation.

**Request Parameters:**

```bash
documentID: The MongoDB ObjectId of the conversation to update.
userID: The ID of the user sending the image.

Form-data: image: The image file to be uploaded.
```

**Real-Time Events (Socket.IO)**

**join-conversation**
Joins a conversation between two users. If the conversation does not exist, it will create a new one.

**Parameters:**

```bash
origin: The ID of the origin user.
destination: The ID of the destination user.
```

**message**
Broadcasts a new message to all users in a specific room.

Parameters:
```bash
message: The message object containing _id, createdAt, text, user, and optionally image.
documentID: The MongoDB document ID of the conversation.
```

**leave-room**
Leaves a specific chat room.

Parameters:
```bash
roomID: The room ID to leave.
```

**disconnect**
Handles a user disconnecting from the socket.

## Tech Stack
**Node.js**: JavaScript runtime used for the server.

**Express.js**: Framework for building the REST API.

**Socket.IO**: Library for real-time web communication.

**MongoDB**: NoSQL database for storing chat messages and metadata.

**AWS S3**: Cloud storage for handling image uploads.

**Multer**: Middleware for handling file uploads.

## Demo

https://drive.google.com/file/d/1MUip5CrBHZ7KmnZh4zePXab_v2CnwF7q/view?usp=sharing
