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
var collections = ["articles", "notes"];





// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

module.exports = function (app) {
    app.get("/", function (req, res) {


        db.articles.find({}).sort({ articleID: -1 }).limit(15, function (error, found) {
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
                    // console.log("There is an error");
                    // console.log("WHy isn't this running???")
                    console.log(error);
                    articlesInDb = found.length || 0;
                }
                else {
                    //  res.json(found);
                    console.log("Why isn't this running???")
                    console.log("found.length is " + found.length);
                    articlesInDb = found.length;
                    organizeScrapedData(articlesInDb);
                }
            });

         function organizeScrapedData(articlesInDb){

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

                var date = summary.substring(0, 13);

                summary = summary.slice(16).split("read more");

                summary = summary[0];

                result[i] = {
                    title: title,
                    link: link,
                    date: date,
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

                            //The ID of the first (ie, most recent) article is given the highest number, so that later it can be displayed to the user from the highest ID to the lowest, which will be the newest to the oldest. 
                            //It will be organized high to low because the articles already in the database already have lower numbers. 

                            let articleID = articlesInDb + (10 - i);
                            console.log("articleID is " + articleID);
                        //    console.log(toDatabase);
                        //    console.log("articlesInDb is " + articlesInDb);
                         //   console.log("result.length is " + result.length);
                         //   console.log("toDatabase.length is " + toDatabase.length);
                            db.articles.insert({ "title": title, "link": link, "date": date, "summary": summary , "articleID": articleID});
                            console.log(title + "has been added to the database");
                            if(i===0){
                                
                                db.articles.update({"newest": true}, {$set: {"newest": false}} );
                                db.articles.update({"title": result[0].title}, {$set: {"newest": true}});
                            }




                           

                        }
                    }
                });

   
            });



            
            // let articleID = articlesInDb + toDatabase.length;
            // //  for(let i = (articlesInDb + 1); 
            // console.log("Is THIS running???")
            //  for(let i=0; i<toDatabase.length; i++){
            //      db.articles.insert({ "title": result[i].title, "link": result[i].link, "summary": result[i].summary , "articleID": articleID});
            //      articleID--;
            // console.log(title + " has been added to the database");
            //  }
            // console.log("result is: ");
            // console.log(result);
            res.send("Scraped!");
    } 
        });
    });

    app.post("/articles/:id", function(req, res) {
        var condition = "id = " + req.params.id;
      
        console.log("condition", condition);
        console.log("req is ");
        console.log(req);

        db.notes.insert({"title": req.body.title, "body": req.body.body}, function (error, notesdb) {
            if (error){
                console.log(error);
            }
            else{
            return db.articles.update({_id: req.params.id}, { $push: {"notes": notesdb._id}});
            }
        });
        // .then(function(articlesdb) {
        //     res.json(articlesdb);
        // }).catch(function (err){
        //     res.json(err);
        // })
      
      
        // //   function(result) {
        // //   if (result.changedRows == 0) {
        // //     // If no rows were changed, then the ID must not exist, so 404
        // //     return res.status(404).end();
        // //   } else {
        // //     res.status(200).end();
        //   }
        // });
      });





}