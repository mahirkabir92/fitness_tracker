const express = require("express");
const app = express();
const path = require("path");
const Workout = require("./models/workout");
var session = require('express-session');
var passport = require('passport')

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


app.listen(3000, () => {
    console.log("We are going on the port my friend");
})