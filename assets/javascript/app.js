$(document).ready(function(){
    //declare init variables
    const categoryURL = "https://opentdb.com/api_category.php";
    const questionURL="https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&category=";
    
    let questionCategories;
    let questionPool;
    let selectedCategory;
    let questionIndex;
    let categoryList = $("#category-list");
    let categoryDisplay = $("#category-display");
    let questionDisplay = $("#question-display");
    let catHeading = $("#cat-heading");
    let questionHeading = $("#question-heading");
    let answerButtons = $(".answer");
    let resultDisplay = $("#result-display");
    let checkDisplay = $("#check-answer");
    let correct = 0;

    //hide qnuestion slides until ready to play
    questionDisplay.hide();
    resultDisplay.hide();

    //builds list items to create category buttons
    function buildCategories(categories){
        let list = $("<ul>");
        for(var i =0; i < categories.length ; i++){
            let listItem = $("<li>");
            listItem.text((categories[i].name).replace("Entertainment: ", "").replace("Science: ","")).attr("data-id",categories[i].id).addClass("categories");
            list.append(listItem);
        }
        categoryList.append(list);
    }
    function checkAnswer(answer){
        console.log(`You picked: ${answer}`);
        console.log(`The answer was: ${questionPool[questionIndex].correct_answer}`);
        answerButtons.hide();
        if(answer === questionPool[questionIndex].correct_answer){
            console.log("Correct");
            checkDisplay.html(`You picked the correct answer! The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}</span>`)
            correct++
        }
        else if (answer === "ran-out-of-time"){
            checkDisplay.html(`Sorry, time is up! The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}</span>`)
        }
        else {
            console.log("Wrong");
            checkDisplay.html(`Sorry, you picked the wrong answer! The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}</span>`)
        }
        questionIndex++ //incease index so we can process the next quesiton once this one is answered or runs out of time
        console.log(questionIndex);
        
        var nextTimer = setTimeout(function(){
            answerButtons.show();
            checkDisplay.empty();
            displayQuestion(questionPool[questionIndex]);
        },5000);
    }

    function resetGame(){
        questionDisplay.hide();
        resultDisplay.hide();
        categoryDisplay.show();
        correct = 0;
    }

    //Take in array item and genreates quesiton to display on screen
    function displayQuestion(question){
        if(questionIndex < questionPool.length){
            catHeading.html(`Selected Category: ${question.category.replace("Entertainment: ", "").replace("Science: ","")}`);
            questionHeading.html(question.question);
    
            //insert correct answer into list of wrong answers
            let answerList = question.incorrect_answers.slice();
            answerList.splice(Math.floor(Math.random() * (answerList.length+1)), 0, question.correct_answer);
            answerButtons.each(function (index, data) {
                $(data).html(answerList[index]);
            });
            var quizTimer = setTimeout(function(){
                checkAnswer("ran-out-of-time");
            },10000);

            $('.answer').off().on('click', function(){
                clearTimeout(quizTimer);
                checkAnswer($(this).html());
            });
        }
        else{
            //game is over display results
            questionDisplay.hide();
            $("#correct").html(`You got ${correct} out of ${questionPool.length} correct!`);
            resultDisplay.show();
            $('#restart').off().on('click', function(){
                resetGame();
            });
        }

    }

    //runs game logic
    function startGame(){
        //Hide display since we have selected a category
        categoryDisplay.hide();
        questionDisplay.show();
        questionIndex = 0;
        displayQuestion(questionPool[questionIndex]);
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
