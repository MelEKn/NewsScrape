var express = require("express");
var mongojs = require("mongojs");
var logger = require ("morgan");
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
app.use(logger("dev"));


// Database configuration
var databaseUrl = "sciencedailydb";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.send("Hello world");
    });





    app.get("/displayJSON", function (req, res) {

        db.articles.find({}, function (error, found) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(found);
            }
        });

    });



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







}