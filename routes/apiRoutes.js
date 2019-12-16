var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
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


        db.articles.find({}).sort({ _id: -1 }, function (error, found) {
            if (error) {
                console.log(error);
            }
            else {
                var handleArticles = {
                    articles: found
                }
                res.render("index", handleArticles);
            }
        });
        //    res.send("Hello world");

    });



    // Route 1
    // =======
    // This route will retrieve all of the data
    // from the "articles" collection as a json (this will be populated
    // by the data you scrape using the next route)

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


    // Route 2
    // =======
    // When you visit this route, the server will
    // scrape data from the site of your choice, and save it to
    // MongoDB.

    app.get("/scrape", function (req, res) {
        axios.get("https://sciencedaily.com/news/").then(function (response) {
            var $ = cheerio.load(response.data);
            var result = [];
            var toDatabase = [];
            let articlesInDb;
            //  $("#featured_shorts li").each(function (i, element) {

            db.articles.find({}, function (error, found) {
                if (error) {
                    console.log("There is an error");
                    console.log("WHy isn't this running???")
                    console.log(error);
                    articlesInDb = found.length || 0;
                }
                else {
                    //  res.json(found);
                    console.log("Why isn't this running???")
                    console.log("found.length is " + found.length);
                    articlesInDb = found.length;
                }
            });

            $("#featured_blurbs .tab-pane").each(function (i, element) {
                console.log(i);
                console.log("articlesInDb is " + articlesInDb);

               // console.log(element);



                //  console.log(element);

                //    result[i].title = $(element).find("a").html();
                // console.log(title);
                // console.log("---");

                var title = $(element).find(".latest-head").text();
                var link = "https://www.sciencedaily.com" + $(element).find("a").attr("href");
                var summary = $(element).find(".latest-summary").text().trim();

                summary = summary.slice(16).split("read more");

                summary = summary[0];

                result[i] = {
                    title: title,
                    link: link,
                    summary: summary
                }



                //Checks if there's any article by the scraped title in the database. Only insert a new article if it's not found.
                db.articles.findOne({ "title": title }, function (error, found) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        if (found) {
                            console.log(found.title + " is already in the database");

                        } else {
                            toDatabase.push(result[i]); 
                            console.log(toDatabase);
                            console.log("articlesInDb is " + articlesInDb);
                            console.log("result.length is " + result.length);
                            console.log("toDatabase.length is " + toDatabase.length);


                           

                        }
                    }
                });

                

               





            });
            
            let articleID = articlesInDb + toDatabase.length;
            //  for(let i = (articlesInDb + 1); 
            console.log("Is THIS running???")
             for(let i=0; i<toDatabase.length; i++){
                 db.articles.insert({ "title": result[i].title, "link": result[i].link, "summary": result[i].summary , "articleID": articleID});
                 articleID--;
            console.log(title + " has been added to the database");
             }
            console.log("result is: ");
            console.log(result);
     //       res.send("Scraped!");
        });
    });







}