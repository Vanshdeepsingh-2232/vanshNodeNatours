const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//UNcaught Exception

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log(err);

  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

//import the express app which is in the same folder

const DB =
  'mongodb+srv://vanshdeepsingh1030:rv97wjl6xCub5EKQ@cluster0.0htttjj.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';

// const DB = 'mongodb://localhost:27017/natours';

//mongodb+srv://vanshdeepsingh1030:<password>@cluster0.0htttjj.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0

//connection with the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

//start the server using express imported app
app.listen(8000, () => {
  console.log(' APP RUNNING....');
});

//Unhandled Rejections kinda like A safety net.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
