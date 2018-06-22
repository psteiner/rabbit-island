// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;

// cels
var celRows = 15;
var celCols = 15;
var celPadding = 1;
var celWidth = 30;
var celHeight = 30;
var celOffsetLeft = (canvas.width - celRows * celWidth) / 2;
var celOffsetTop = (canvas.height - celCols * celHeight) / 2;

//               0: ocean,  1: steam,  2: lava,   3: rock,   4: soil,   5: grass,  6: fire,   7:  lake

const ocean = 0;
const steam = 1;
const lava = 2;
const rock = 3;
const soil = 4;
const grass = 5;
const fire = 6;
const lake = 7;

// celStates.length => 8
var celStates = ["#3355FF", "#FFFFFF", "#FF4400", "#999999", "#9B7858", "#229922", "#FF9102", "#7FDDFF"];



// initialize the island map
//
var cels = [];

for (var c = 0; c < celCols; c++) {
    cels[c] = [];
    for (var r = 0; r < celRows; r++) {
        cels[c][r] = {
            x: 0,
            y: 0,
            z: 0,
            state: lake,
            age: 0,
            burning: 0
        };
    }
}

// leave the corner cels as ocean
// how much corner depends on how big the map
var minCol = Math.round(celCols * 0.1);
var maxCol = Math.round(celCols * 0.9);
var minRow = Math.round((celRows - 1) * 0.1);
var maxRow = Math.round((celRows - 1) * 0.9);

var cycles = 0;
var cyclesPerDay = 10;

function runSim() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIsland();
    drawDays();

    if (++cycles > cyclesPerDay) {
        days++;
        updateIsland();
        cycles = 0;
    }

    requestAnimationFrame(runSim);
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
            if (cel.burning == 1) {
                ctx.font = "12pt Arial";
                ctx.fillStyle = "yellow";
                ctx.fillText("!!!", cel.x + 10, cel.y + 20);
            }
        }
    }
}

function updateIsland() {
    for (var c = minCol; c < maxCol; c++) {
        for (var r = minRow; r < maxRow; r++) {

            var cel = cels[c][r];
            cel.burning = 0;
            cel.age++;

            // flag to allow updating the cel to the next state
            //
            var update = cel.age % getRandomInt(293) == 0;

            // progress cell state from ocean to grass, not late
            //
            if (update && cel.state < grass) {
                cel.state++;
            }

            // random lava outbreak!
            if (getRandomInt(2048) == 0) {
                cel.state = 2;
                cel.burning = 1;
            }

            // random lake!
            if (getRandomInt(2048) == 3) {
                cel.state = lake;
            }

            // do something with the neighbouring cels
            // https://stackoverflow.com/questions/652106/finding-neighbours-in-a-two-dimensional-array
            //
            // for (var n = Math.max(0, c - 1); n <= Math.min(c + 1, celCols - 1); n++) {
            //     for (var m = Math.max(0, r - 1); m <= Math.min(r + 1, celRows - 1); m++) {
            //         if (n !== c || m !== r) {
            //             // console.log("c:" + c + " r:" + r);
            //             // console.log("n:" + n + " m:" + m);
            //             if (cel.state === 1) {
            //                 //cels[n][m].state = cel.state;
            //             }
            //         }
            //     }
            // }

        }
    }
}


function createIsland() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    generateMap();
    drawIsland();
    drawDays();
}


// populates the island map with its initial geography
// 
function generateMap() {
    // create the island shape - first start with a random cel
    //                 0 .. 9                  0 .. 9
    // var hotspot = cels[getRandomInt(celCols)][getRandomInt(celRows)];
    
    // iterate over the map cells, excluding the ocean corners
    // getRandomInt(minCol, celCols)
    // getRandomInt(minRow, celRows)
    for (var c = minCol; c < maxCol; c++) {
        for (var r = minRow; r < maxRow; r++) {

            // default to grass for now to see if this works or not!
            var cel = cels[c][r].state = grass;

            // do something with the neighbouring cels
            // https://stackoverflow.com/questions/652106/finding-neighbours-in-a-two-dimensional-array
            //
            // for (var n = Math.max(0, c - 1); n <= Math.min(c + 1, celCols - 1); n++) {
            //     for (var m = Math.max(0, r - 1); m <= Math.min(r + 1, celRows - 1); m++) {
            //         if (n !== c || m !== r) {
            //             // console.log("c:" + c + " r:" + r);
            //             // console.log("n:" + n + " m:" + m);
            //             if (cel.state === 1) {
            //                 //cels[n][m].state = cel.state;
            //             }
            //         }
            //     }
            // }

        }
    }    
}

// returns an integer between min and less than but not including max
// e.g. getRandomInt(3) -> 0, 1, or 2
//      getRandomInt(3, 7) -> 3, 4, 5, or 6
//
// Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
//
function getRandomInt(min = 0, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawDays() {
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Days: " + days, 10, canvas.height - 30);
}

createIsland();
runSim();