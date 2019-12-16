// Whenever someone clicks an article card 
$(document).on("click", ".article", function() {
    // Empty the notes from the note section
    $(".notes").empty();
    console.log("On click worked");
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    console.log("thisId is " + thisId);
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/displayJSON",
      _id: thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        let selectedArticle = {};
        for(let i=0; i<data.length;i++){
            if(data[i]._id === thisId){
                selectedArticle = data[i];
                selectedArticle.selected = true;
            }
        }
        // The title of the article
        $(".notes").append("<h6>" + selectedArticle.title + "</h6>");
        // An input to enter a new title
        $(".notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $(".notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $(".notes").append("<button data-id='" + selectedArticle._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });


  $(document).on("click", "#savenote", function() {
      // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/:" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

