const express = require('express');
const router = express.Router();
const passport = require('passport');

// Import your controllers
const workoutController = require("../controllers/workoutController");
const ensureLoggedIn = require("../middleware/ensureLoggedIn");

// Define your routes
router.get("/", workoutController.index);

router.get("/new", ensureLoggedIn, workoutController.new);

router.get("/:id", workoutController.show);

router.post("/", ensureLoggedIn, workoutController.create);

router.put("/:id", ensureLoggedIn, workoutController.update);

router.get("/:id/edit", ensureLoggedIn, workoutController.edit);

router.delete("/:id", ensureLoggedIn, workoutController.delete);

router.get('/', function(req, res, next) {
  res.redirect('/new');
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // Which passport strategy is being used?
  'google',
  {
    // Requesting the user's profile and email
    scope: ['profile', 'email'],
    // Optionally force pick account every time
    prompt: "select_account"
  }
));

router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/new',
    failureRedirect: '/new'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function() {
    res.redirect('/new');
  });
});

module.exports = router;