var highScoresBtn = document.querySelector("#highScoresBtn");
var gameBtn = document.querySelector("#startBtn");
var answers = document.querySelector("#answers");
var timeEl = document.querySelector("#timer");
var correctMessage = document.querySelector("#rightWrong");
var initialForm = document.querySelector("#initials");
var initialInput = document.querySelector("#initial-text");
var highScoresEl = document.querySelector("#highScoresList");
var timeLeft = 0;
var startingTime = 60;
var questionList=[];
var randomQuestionList=[];
var gameRunning=false;
var correctAnswerList=[];
var question=0;
var highScoresList=[];
var timerInterval;
var scoresVisible=false;

//first answer is the correct one
questionList.push(['Primitive data types do not include:', 'Array', 'String', 'Number', 'Boolean']);
questionList.push(['When initializing an array with elements, what are they encased in?', 'Square Brackets', 'Quotes', 'Curly Brackets', 'Parentheses']);
questionList.push(['This type of loop includes an initial expression and an expression run at the end of each loop:', 'For Loop', 'Foreach Loop', 'While Loop', 'Do While Loop']);
questionList.push(['This type of variable can be stored in Local Storage as-is:', 'String', 'Array', 'Object', 'Date']);
questionList.push(['Every HTML element can have this many parent elements', '1 parent', '2 parents', '3 parents', 'As many parents as you want']);
questionList.push(['A local variable can be modified by this scope:', 'The current function and its children', 'The current function and its parents', 'The current function and its parents and children', 'Only the current function']);

gameBtn.addEventListener("click", startGame);
gameBtn.style.display="inherit";
initialForm.style.display="none";

function init(){
    highScoresList = (JSON.parse(localStorage.getItem("scores")) || []);
}

function storeHighScores() {
    localStorage.setItem("scores", JSON.stringify(highScoresList));
}

function startGame(){
    hideHighScores();
    correctMessage.textContent="";
    gameBtn.style.display = "none";
    initialForm.style.display="none";
    gameRunning=true;
    startTimer();
    shuffleQuestionsAnswers();
    question=0;
    displayQuestion();
}

function startTimer(){
    timeLeft = startingTime;
    timerInterval = setInterval(function(){
        if(!gameRunning){
            return;
        }
        timeLeft--;
        displayTime();
    }, 1000)
}

function shuffleQuestionsAnswers(){
    var questionsUnused=[];
    randomQuestionList=[];
    correctAnswerList=[];
    for (var i=0; i<questionList.length; i++){
        //adds all the indices of questions to the unused questions list
        questionsUnused.push(i);
    }
    while (questionsUnused.length>0){
        //removes a random index from questionsUnused
        var currentQuestion=questionsUnused.splice(Math.floor(Math.random() * questionsUnused.length), 1);
        //uses that index to get the values of that question/answers to a temporary list
        var tempAnswerList=questionList[currentQuestion];
        //adds the four indicies of the answers to the unused answers list
        var answersUnused=[1,2,3,4];
        //adds the question to the main list
        randomQuestionList.push([tempAnswerList[0]]);
        while (answersUnused.length>0){
            //removes a random index from answersUnused
            var currentAnswer=answersUnused.splice(Math.floor(Math.random() * answersUnused.length), 1);
            //uses that index to add the answer to the last question/answer array in the list (the most recent one added)
            randomQuestionList.at(-1).push(tempAnswerList[currentAnswer]);
            //the correct answer will always be the one at index 1 in the intial list
            //so if we just added that index, get the location it was added to and add that to the correct answer list
            if(currentAnswer==1){
                correctAnswerList.push(randomQuestionList.at(-1).length-1);
            }
        }
    }
}

function displayTime(){
    if(timeLeft<0){
        timeLeft=0;
    }
    timeEl.textContent= "Time: " + timeLeft;
    if(timeLeft==0){
        endGame(false);
    }
}

function displayQuestion(){
    answers.innerHTML='';
    if(question>=randomQuestionList.length){
        return endGame(true);
    }
    var currentQuestion = randomQuestionList[question];
    var questionText=document.createElement("h2");
    questionText.textContent = currentQuestion[0];
    var questionEl=document.createElement("li");
    questionEl.style.listStyleType = 'none';
    questionEl.appendChild(questionText);
    answers.appendChild(questionEl);
    for (var i=1; i<currentQuestion.length; i++){
        var li=document.createElement("li");
        li.textContent = currentQuestion[i];
        li.setAttribute("data-index", i);
        answers.appendChild(li);
    }
}

answers.addEventListener("click", function(event){
    var index = event.target.getAttribute("data-index");
    if(index){
        checkAnswer(index);
    }
});

document.addEventListener("keydown", function(event){
    if(!gameRunning || event.repeat){
        return;
    }
    var key=event.key;
    if(key>0 && key<5){
        checkAnswer(key);
    }
});

function checkAnswer(index){
    var correctAnswer=correctAnswerList[question];
    if (correctAnswer==index){
        correctMessage.textContent="Correct!";
    } else {
        correctMessage.textContent="Wrong!";
        timeLeft -= 10;
        displayTime();
    }
    if(gameRunning){
        question++;
        displayQuestion();
    }
}

function endGame(gameWon){
    gameRunning=false;
    answers.innerHTML='';
    clearInterval(timerInterval);
    if(gameWon){
        correctMessage.textContent="You won! Input your initials:";
        initialForm.style.display="inherit";
    } else {
        correctMessage.textContent="You lost!";
    }
    gameBtn.style.display = "inherit";
    gameBtn.textContent="Play Again?";
}

initialForm.addEventListener("submit", function(event) {
    event.preventDefault();
    var initialText = initialInput.value.trim();
    // if it is empty, doesn't add it
    if (initialText === "") {
      return;
    }
    if(initialText.length!=3){
        alert("Exactly three letters!");
        return;
    }
    initialText=initialText.toUpperCase();
    sortHighScores(timeLeft, initialText);
    correctMessage.textContent="Your time of " + timeLeft + " seconds is now saved, " + initialText +"!";
    displayHighScores();
    initialForm.style.display="none";
});

function sortHighScores(timeScore, initials){
    if (highScoresList.length==0){
        highScoresList.push([timeScore, initials]);
    } else {
        var i=0;
        for (i=0; i<highScoresList.length; i++){
            //if it has more remaining time, add it before that element
            if(timeScore>highScoresList[i][0]){
                highScoresList.splice(i, 0, [timeScore, initials]);
                break;
            }
        }
        //if didn't find one before the end, add it to the end
        if(i==highScoresList.length){
            highScoresList.push([timeScore, initials]);
        }
    }
    storeHighScores();
}

highScoresBtn.addEventListener("click", function() {
    if (!scoresVisible && !gameRunning){
        displayHighScores();
        return;
    }
    hideHighScores();
});

function displayHighScores(){
    scoresVisible=true;
    highScoresEl.innerHTML='';
    highScoresList.forEach(element => {
        var li=document.createElement("li");
        li.textContent = element[1] + ' ' +String.fromCharCode(0x00A0) + ' ' + element[0] + " seconds";
        highScoresEl.appendChild(li);
    });
    highScoresBtn.textContent="Hide high scores";
}

function hideHighScores(){
    scoresVisible=false;
    highScoresEl.innerHTML='';
    highScoresBtn.textContent="View high scores";
}

init();
//need an eventlistener on the button that starts the timer and starts the game loop
//timer needs a variable that is a setInterval: a function() and 1000 for seconds
//the function needs to decrement the time and call a function
//that function displays the time and stops the game if the timer is 0 (separate function bc it can be called by a wrong answer)

//we need a list of questions and associated answers (an array for each question+answers)
//when we start the game, make a copy of the array with the order of the questions shuffled
//when we start the game, we need to set up the display for the questions and answers (add a list+list elements) *can have the list to begin with to put the listener on
//we display a question and its answers, with the answers shuffled
//to answer a question, we click on one of the answers, and it is right or wrong (maybe also add key listeners, but be careful about it being the press and not holding the key) * event.repeat
//when it is answered, move on to the next question, and display whether it was correct or incorrect
//if it is wrong, deduct time and move the question to the end of the list (call the time display function)
//if we reach the end of the questions, end the game with a win

//when the game ends, display a message based on whether it was a win or a loss
//when the game ends with a win, allow the user to input initials and store their time and initials in local storage