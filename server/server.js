//This file is the entry point to start the server and connect to the database

const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/dotenv');

//Connect to the database
connectDB();

//Start the server
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
})