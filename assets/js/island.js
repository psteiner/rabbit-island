// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var x = canvas.width / 2;
var y = canvas.height - 30;
var days = 0;

// meadows
var meadowRowCount = 3;
var meadowColumnCount = 3;
var meadowPadding = 2;
var meadowWidth = 20;
var meadowHeight = 20;
var meadowOffsetLeft = (canvas.width - meadowRowCount * meadowWidth) / 2;
var meadowOffsetTop = (canvas.height - meadowColumnCount * meadowHeight) / 2;
var meadowStates = ["#9b7858","#999999","#219923"];

var meadows = [];

// initialize the meadow objects
//
for (var c = 0; c < meadowColumnCount; c++) {
    meadows[c] = [];
    for (var r = 0; r < meadowRowCount; r++) {
        meadows[c][r] = {
            x: 0,
            y: 0,
            state: 0
        };
    }
}

var cycles = 0;
var cyclesPerDay = 60;

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMeadow();
    drawDays();
    updateIsland();

    if (++cycles > cyclesPerDay) {
        days++;
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
        }
    }
}

function updateIsland() {
    for (var c = 0; c < meadowColumnCount; c++) {
        for (var r = 0; r < meadowRowCount; r++) {
            var meadow = meadows[c][r];
            var numberOfStates = Object.keys(meadowStates).length;
            var state = getRandomInt(numberOfStates);
            meadow.state++;

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