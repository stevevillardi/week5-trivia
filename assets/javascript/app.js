$(document).ready(function(){
    const categoryURL = "https://opentdb.com/api_category.php";
    const questionURL="https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&category=";
    
    let questionCategories;
    let questionPool;
    let selectedCategory;

    function buildCategories(categories){
        let list = $("<ul>");
        for(var i =0; i < categories.length ; i++){
            let listItem = $("<li>");
            listItem.text((categories[i].name).replace("Entertainment: ", "").replace("Science: ","")).attr("data-id",categories[i].id).addClass("categories");
            list.append(listItem);
        }
        $("#category-list").append(list);
    }

    function startGame(){
        //write code to start trivia game
        $("#category-list").empty();
    }

    //First ajax call to pull categories
    $.ajax({
        method: "GET",
        url: categoryURL
    })
    .done(function( data ) {
        questionCategories = data.trivia_categories;
        console.log(questionCategories);

        //Loop through categories to build out ul list of available categories
        buildCategories(questionCategories);

        $(document).on('click', '.categories', function(){
            console.log(`Selected Category: ${$(this).attr("data-id")}`);
            selectedCategory = $(this).attr("data-id");
    
            //second ajax call to grab questions based on selected category
            $.ajax({
                method: "GET",
                url: questionURL + selectedCategory //Build question list based off of user selection
            })
            .done(function( data ) {
                questionPool = data.results;
                console.log(questionPool);

                startGame();
            });
        });
    });

});

