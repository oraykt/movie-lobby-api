# Movie Lobby API

A RESTful API for managing a movie lobby system. This API allows for creating, reading, updating, and deleting movies with admin authentication.

## Features

- **Create Movie**: Add new movies to the database.
- **Read Movies**: Retrieve a list of all movies.
- **Update Movie**: Modify existing movie details.
- **Delete Movie**: Remove movies from the database.
- **Role-Based Access Control**: Only admin users can create, update, or delete movies.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/oraykt/movielobby.git
   cd movielobby
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```
    MONGODB_CERT_URI=
    MONGODB_CERT_PATH=
    MONGODB_CERT_AUTH= # Set to 1 for certificate authentication, 0 for username/password
    MONGODB_AUTH_URI=
    #MONGODB_AUTH_URI=
    MONGODB_USER=
    MONGODB_PASSWORD=
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## API Endpoints

### Create a Movie

- **URL**: `/movies`
- **Method**: `POST`
- **Headers**: 
  - `x-user-role`: `admin`
- **Request Body**:
  ```json
  {
    "title": "Inception",
    "genre": "Sci-Fi",
    "rating": 9.0,
    "streamingLink": "https://example.com/inception"
  }
  ```
- **Success Response**:
  - **Code**: `201 CREATED`
  - **Content**: 
    ```json
    {
      "id": "60d5f9f5f9f5f9f5f9f5f9f5",
      "title": "Inception",
      "genre": "Sci-Fi",
      "rating": 9.0,
      "streamingLink": "https://example.com/inception"
    }
    ```

### Get All Movies

- **URL**: `/movies`
- **Method**: `GET`
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: 
    ```json
    [
      {
        "id": "60d5f9f5f9f5f9f5f9f5f9f5",
        "title": "Inception",
        "genre": "Sci-Fi",
        "rating": 9.0,
        "streamingLink": "https://example.com/inception"
      }
    ]
    ```

### Update a Movie

- **URL**: `/movies/:id`
- **Method**: `PUT`
- **Headers**: 
  - `x-user-role`: `admin`
- **Request Body**:
  ```json
  {
    "title": "Inception Updated",
    "rating": 9.5
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: 
    ```json
    {
      "id": "60d5f9f5f9f5f9f5f9f5f9f5",
      "title": "Inception Updated",
      "genre": "Sci-Fi",
      "rating": 9.5,
      "streamingLink": "https://example.com/inception"
    }
    ```

### Delete a Movie

- **URL**: `/movies/:id`
- **Method**: `DELETE`
- **Headers**: 
  - `x-user-role`: `admin`
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: 
    ```json
    {
      "message": "Movie deleted successfully"
    }
    ```

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling tool
- **Jest**: Testing framework
- **Supertest**: HTTP assertions for testing
