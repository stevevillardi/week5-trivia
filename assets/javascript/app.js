$(document).ready(function(){
    //declare init variables
    const categoryURL = "https://opentdb.com/api_category.php";
    const answerTime = 10000; //amount of time to wait before time out on quesiton choice;
    const reviewTime = 5000; //amount of time to wait between questions
    
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
    let questionProgress = $("#question-progress");
    let correct = 0;
    let questionURL=`https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&category=`;

    //hide qnuestion slides until ready to play
    questionDisplay.hide();
    resultDisplay.hide();

    $('.btn-group').off().on('click', function(){
        setTimeout(function() {
            let selectedDifficulty = $(".active")[0].innerText;
            if (selectedDifficulty === "Hard Difficulty"){
                questionURL=`https://opentdb.com/api.php?amount=10&difficulty=hard&type=multiple&category=`;
            }
            else if (selectedDifficulty === "Easy Difficulty"){
                questionURL=`https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple&category=`;
            }
            else{
                questionURL=`https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&category=`;
            }
            console.log(difficulty);
            console.log(questionURL);
        },500);
    });


    function updateProgress(index){
        questionProgress.html(`Question ${index + 1} of ${questionPool.length}`)
        questionProgress.css("width",(index + 1) * 10 + "%")
    }

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

        $('#timer').pietimer({
            seconds: 5,
            color: '#007bff',
            height: 0,
            width: 0
        },
        function(){
            answerButtons.show();
            checkDisplay.empty();
            displayQuestion(questionPool[questionIndex]);
        });
        $('#timer').pietimer('start');

        if(answer === questionPool[questionIndex].correct_answer){
            console.log("Correct");
            checkDisplay.html(`You picked the correct answer!<br>The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}.</span>`)
            correct++
        }
        else if (answer === "ran-out-of-time"){
            checkDisplay.html(`Sorry, time is up!<br>The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}.</span>`)
        }
        else {
            console.log("Wrong");
            checkDisplay.html(`Sorry, you picked the wrong answer!<br>The correct answer was <span class="highlight">${questionPool[questionIndex].correct_answer}.</span>`)
        }
        questionIndex++ //incease index so we can process the next question once this one is answered or runs out of time
        console.log(questionIndex);
        
    }
    function resetGame(){
        questionDisplay.hide();
        resultDisplay.hide();
        categoryDisplay.show();
        updateProgress(0);
        correct = 0;
    }

    //Take in array item and genreates quesiton to display on screen
    function displayQuestion(question){
        if(questionIndex < questionPool.length){
            updateProgress(questionIndex);
            catHeading.html(`Selected Category: ${question.category.replace("Entertainment: ", "").replace("Science: ","")}`);
            questionHeading.html(question.question);
    
            //insert correct answer into list of wrong answers
            let answerList = question.incorrect_answers.slice();
            answerList.splice(Math.floor(Math.random() * (answerList.length+1)), 0, question.correct_answer);
            answerButtons.each(function (index, data) {
                $(data).html(answerList[index]);
            });

            $('.answer').off().on('click', function(){
                $('#timer').pietimer('pause');
                checkAnswer($(this).html());
            });

            $('#timer').pietimer({
                seconds: 10,
                color: '#007bff',
                height: 75,
                width: 75
            },
            function(){
                checkAnswer("ran-out-of-time");
            });
            $('#timer').pietimer('start');
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
        updateProgress(questionIndex);
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
        $(".category").text("Select a Category");

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

