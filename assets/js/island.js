// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;

// cels
var celRows = 20;
var celCols = 20;
var celPadding = 1;
var celWidth = 30;
var celHeight = 30;
var celOffsetLeft = (canvas.width - celRows * celWidth) / 2;
var celOffsetTop = (canvas.height - celCols * celHeight) / 2;

//               ocean,     steam,     lava,      rock,      soil,      grass,     lake
var celStates = [{ ocean: "#3355FF" }, { steam: "#FFFFFF" }, { lava: "#ff4400" }, { rock: "#999999" }, { soil: "#9b7858" }, { grass: "#229922" }, { lake: "7fddff" }];

var cels = [];

// initialize the cel objects
//
for (var c = 0; c < celCols; c++) {
    cels[c] = [];
    for (var r = 0; r < celRows; r++) {
        cels[c][r] = {
            x: 0,
            y: 0,
            state: celStates[1].grass,
            age: 0,
            update: 0,
            burnit: 0
        };
    }
}

var cycles = 0;
var cyclesPerDay = 10;

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIsland();
    drawDays();

    if (++cycles > cyclesPerDay) {
        days++;
        updateIsland();
        cycles = 0;
    }

    requestAnimationFrame(draw);
}

function drawIsland() {
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {
            var cel = cels[c][r];

            cel.x = (c * (celWidth + celPadding)) + celOffsetLeft;
            cel.y = (r * (celHeight + celPadding)) + celOffsetTop;
            ctx.beginPath();
            ctx.rect(cel.x, cel.y, celWidth, celHeight);
            ctx.fillStyle = celStates[cel.state];
            ctx.fill();
            ctx.closePath();
            // ctx.font = "8pt Arial";
            // ctx.fillStyle = "black";
            // ctx.fillText("s:" + cel.state + " f:" + cel.factor,
            //     cel.x + 2, cel.y + 20);
            if (cel.burnit == 1) {
                ctx.font = "12pt Arial";
                ctx.fillStyle = "yellow";
                ctx.fillText("!!!", cel.x + 10, cel.y + 20);
            }
        }
    }
}

function updateIsland() {
    var states = celStates.length - 1;
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {

            var cel = cels[c][r];
            cel.burnit = 0;
            cel.age++;

            cel.update = cel.age % getRandomInt(293) == 0;

            // progress cell state from ocean to grass
            //
            if (cel.update && cel.state < states - 1) {
                cel.state++;
            }

            // random lava outbreak!
            if (getRandomInt(2048) == 0) {
                cel.state = 1;
                cel.burnit = 1;
            }

            // random lake!
            if (getRandomInt(2048) == 3) {
                cel.state = states;
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

// https://stackoverflow.com/questions/2035522/get-adjacent-elements-in-a-two-dimensional-array
function getNeighbours(cel) {

}

draw();
