//1.dependencies come first
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session")
({
secret:"secret",
resave:false,
saveUninitialized:false
});
require("dotenv").config();
  
//importing user model for passport configuration
const User = require("./models/User");

//import routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const { error } = require("console");

//2. instantiation
const app = express();
const port = 3000;

//3. configuration
//setting up database connections
mongoose.connect(process.env.MONGO_URI);
mongoose.connection
  .once("open", () => {
    console.log("someoneconnected")
  })
  .on("error", (error) =>{
    console.error(`connection error: ${error.message}`);
  });
 
//view engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views/pages"));//specifying the views directory
//4.middleware

app.use(expressSession);//using express session middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); //serving static files from the public directory

//epress session configs
app.use(passport.initialize());
app.use(passport.session());

//passport configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//5.Routes. u should use the imported routes
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", stockRoutes);

// Handling non-existing routes (404) - should come after all routes
app.use((req, res) => {
  res.status(404).send("Oops! page not found.");
});

// Generic error handler (optional, improves debug messages)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Don't worry, something went wrong, but it's on our side.");
});

//6.bootstrsapping server
//shouldalways be the last line inyour file
app.listen(port, () => console.log(`listening on port ${port}`));
