// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;

// meadows
var meadowRowCount = 20;
var meadowColumnCount = 20;
var meadowPadding = 1;
var meadowWidth = 30;
var meadowHeight = 30;
var meadowOffsetLeft = (canvas.width - meadowRowCount * meadowWidth) / 2;
var meadowOffsetTop = (canvas.height - meadowColumnCount * meadowHeight) / 2;
// var meadowStates = {
//     water: '#3355FF',
//     lava: '#ff4400',
//     rock: '#999999',
//     soil: '#9b7858',
//     grass: '#229922',
// };

// var meadowStatesIndexed = [
//     { lava: '#ff4400' },
//     { rock: '#999999' },
//     { soil: '#9b7858' },
//     { grass: '#229922' },
//     { water: '#3355FF' }
// ];

//                   water,    lava,     rock,     soil,     grass
var meadowStates = ["#3355FF","#ff4400","#999999","#9b7858","#229922"];

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
            age: 0,
            factor: 0,
            reset: 0
        };
    }
}

var cycles = 0;
var cyclesPerDay = 10;

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
            // ctx.font = "8pt Arial";
            // ctx.fillStyle = "black";
            // ctx.fillText("s:" + meadow.state + " f:" + meadow.factor, 
            //     meadow.x + 2, meadow.y + 20);
            if ( meadow.reset == 1 ) {
                ctx.font = "12pt Arial";
                ctx.fillStyle = "yellow";
                ctx.fillText("!!!",meadow.x + 10, meadow.y + 20);
            }
        }
    }
}

function updateIsland() {
    var states = meadowStates.length - 1;
    for (var c = 0; c < meadowColumnCount; c++) {
        for (var r = 0; r < meadowRowCount; r++) {
            
            var meadow = meadows[c][r];
            meadow.reset = 0;
            meadow.age++;
            
            meadow.factor = getRandomInt(293);

            var updateState = (meadow.age % meadow.factor) == 0;

            if (updateState && meadow.state < states) {
                meadow.state++;
            }

            // random reset back to lava!
            if (getRandomInt(2048) == 0) {
                meadow.state = 1;
                meadow.reset = 1;
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
