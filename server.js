const express = require("express");
const app = express();
const path = require("path");
const Workout = require("./models/workout");
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override')

const mongoose = require('mongoose');
const port = process.env.PORT || 3000;


require('dotenv').config();
require('./config/passport')

const url = process.env.DATABASE_URL;
mongoose.connect(url, { useNewUrlParser: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})


app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}))

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
  });

app.get("/", async (req, res) => {
    const workouts = await Workout.find({})
    console.log(workouts)
    res.render("home", {workouts})
})

app.get("/workout/:id", async (req, res) => {
    const { id } = req.params;
    const workouts = await Workout.findById(id)
    res.render("detail", {workouts})
})

app.get("/new", (req, res) => {
    res.render("new")
})

// Use method-override middleware
app.use(methodOverride('_method')); // This tells Express to look for "_method" query parameter

app.post("/workouts", async(req, res) => {
    const newWorkout = new Workout(req.body);
    await newWorkout.save();
    res.redirect(`workout/${newWorkout._id}`)
})

app.get("/workout/:id/edit", async (req, res) => {
    const { id } = req.params;
    const workout = await Workout.findById(id)
    res.render("edit", {workout})
})

app.put("/workout/:id", async (req, res) =>{
    const { id } = req.params;
    const workout = await Workout.findByIdAndUpdate(id, req.body, { runValidators: true })
    res.redirect(`/workout/${workout._id}`)
})

app.delete("/workout/:id", async (req, res) => {
    const { id } = req.params;
    const deleteWorkout = await Workout.findByIdAndDelete(id)
    res.redirect("/")
})

// Google OAuth authentication route
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route after Google OAuth authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect or handle the response here
    res.redirect("/"); // You can redirect to a different route or page
  }
);

app.get("/logout", (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                console.error("Logout error:", err);
                res.status(500).send("Logout failed");
            } else {
                res.redirect("/new"); // Redirect to the home page or any other desired page
            }
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("Logout failed");
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


  

app.listen(port, () => {
    console.log("Server is running" + port);
})

module.exports = app;