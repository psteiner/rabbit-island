// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var x = canvas.width / 2;
var y = canvas.height - 30;
var days = 0;

// meadows
var meadowRowCount = 5;
var meadowColumnCount = 5;
var islandSize = meadowRowCount * meadowColumnCount;
var meadowPadding = 2;
var meadowWidth = 50;
var meadowHeight = 50;
var meadowOffsetLeft = (canvas.width - meadowRowCount * meadowWidth) / 2;
var meadowOffsetTop = (canvas.height - meadowColumnCount * meadowHeight) / 2;

//    forest: "#146357",
// lava: "#FF7905",

var meadowStates = [
    "#666666", // rock
    "#9b7858", // soil
    "#219923", // grass
]

// "#71cbff", // water


var meadows = [];

// initialize the meadow objects
//
for (var c = 0; c < meadowColumnCount; c++) {
    meadows[c] = [];
    for (var r = 0; r < meadowRowCount; r++) {
        meadows[c][r] = {
            x: 0,
            y: 0,
            state: 0,
            age: 0
        };
    }
}

var cycles = 0;
var cyclesPerDay = 100;

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMeadow();
    drawDays();

    if (++cycles > cyclesPerDay) {
        days++;
        updateIsland();
        cycles = 0;
    }


    requestAnimationFrame(draw);
}

function drawMeadow() {
    for (var c = 0; c < meadowColumnCount; c++) {
        for (var r = 0; r < meadowRowCount; r++) {
            var meadow = meadows[c][r];

            meadow.x = (c * (meadowWidth + meadowPadding)) + meadowOffsetLeft;
            meadow.y = (r * (meadowHeight + meadowPadding)) + meadowOffsetTop;
            ctx.beginPath();
            ctx.rect(meadow.x, meadow.y, meadowWidth, meadowHeight);
            ctx.fillStyle = meadowStates[meadow.state];
            ctx.fill();
            ctx.closePath();
            ctx.font = "8pt Arial";
            ctx.fillStyle = "white";
            ctx.fillText("s:" + meadow.state + " f:" + meadow.factor, 
                meadow.x + 10, meadow.y + meadowHeight / 2);
        }
    }
}

function updateIsland() {
    var numberOfStates = Object.keys(meadowStates).length;

    for (var c = 0; c < meadowColumnCount; c++) {
        for (var r = 0; r < meadowRowCount; r++) {
            var meadow = meadows[c][r];

            // update each meadow
            meadow.age++;
            meadow.factor = getRandomInt(10);
            var updateState = (meadow.age % meadow.factor) == 0;

            if (updateState) {
                var newState = (meadow.state + 1) % numberOfStates;
                meadow.state = newState;
            }
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function drawDays() {
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Days: " + days, 10, canvas.height - 30);
}

draw();