// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var logger = require ("morgan");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

var PORT = process.env.PORT || 3000;

// Use morgan logger for logging requests
app.use(logger("dev"));



// Serve static content for the app from the "public" directory in the application directory.
//app.use(express.static("public"));

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));



// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var models = require("./models");

// //Routes
 require("./routes/apiRoutes")(app);
 require("./routes/htmlRoutes")(app);


// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});