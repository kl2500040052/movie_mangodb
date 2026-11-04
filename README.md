# CineVault – Movie Management Website

A simple website with Create, Read, Update and Delete features using MongoDB Atlas, Node.js and Express.

## 1. Requirements
- Node.js and npm installed
- Your MongoDB Atlas cluster running
- A MongoDB Atlas database user and connection string

## 2. Setup
Open this project folder in VS Code terminal and run:

```bash
npm install
```

Copy `.env.example` and rename the copy to `.env`. Put your Atlas connection string in `.env`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
PORT=3000
```

Replace the placeholders with your real Atlas database username, password and cluster host. If your password contains special characters, URL-encode them. Do not share `.env` or commit it to GitHub.

The app automatically uses database `moviesdb` and collection `movies`, matching the database created in Atlas.

## 3. Run
```bash
npm start
```
Open http://localhost:3000 in your browser.

## 4. Features
- Add movie: inserts a document into `moviesdb.movies`
- View/search: reads movie documents from MongoDB
- Edit: updates a movie by its MongoDB `_id`
- Delete: deletes a movie by its MongoDB `_id`

If Atlas rejects the connection, check that your cluster is active, the database user credentials are correct, and your current IP is allowed in Atlas Network Access.
