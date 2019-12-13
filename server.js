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
// require("./routes/apiRoutes")(app);
// require("./routes/htmlRoutes")(app);


// Database configuration
var databaseUrl = "sciencedailydb";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Hello world");
});

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)

app.get("/displayJSON", function (req, res) {
  
    db.articles.find({}, function(error, found){
      if(error){
        console.log(error);
      }
      else{
        res.json(found);
      }
    });
  
  });
   
  // Route 2
  // =======
  // When you visit this route, the server will
  // scrape data from the site of your choice, and save it to
  // MongoDB.
  // TIP: Think back to how you pushed website data
  // into an empty array in the last class. How do you
  // push it into a MongoDB collection instead?
  app.get("/scrape", function (req, res) {
    axios.get("https://sciencedaily.com/news/").then(function (response) {
      var $ = cheerio.load(response.data);
      var result = [];
    //  $("#featured_shorts li").each(function (i, element) {

        $("#featured_blurbs .tab-pane").each(function (i, element) {

        

      //  console.log(element);
  
     //    result[i].title = $(element).find("a").html();
        // console.log(title);
        // console.log("---");
        
        var title =  $(element).find(".latest-head").text();
        var link =  "https://www.sciencedaily.com" + $(element).find("a").attr("href");
        var summary = $(element).find(".latest-summary").text().trim();

        summary = summary.slice(16).split("read more");

        summary = summary[0];

        result[i] = summary;



     //   result[i].link = $(element).find("a").attr("href");

      //  console.log(link);
        // var summary = $(element).find("p").text();
  
         db.articles.insert({"title": title, "link": link, "summary": summary});
      });
      console.log("result is: ");
      console.log(result);
      res.send("Scraped!");
    });
  });


// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});