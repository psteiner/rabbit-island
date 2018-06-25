// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;

// cels
var celRows = 30;
var celCols = 30;
var celPadding = 1;
var celWidth = 20;
var celHeight = 20;
var celOffsetLeft = (canvas.width - celRows * celWidth) / 2;
var celOffsetTop = (canvas.height - celCols * celHeight) / 2;

//               0: ocean,  1: steam,  2: lava,   3: rock,   4: soil,   5: grass,  6: fire,   7:  lake

// const ocean = 0;
// const rock = 1;
// const soil = 2;
// const grass = 3;
// const fire = 4;
// const lake = 5;

const states = { 
    ocean: "#3355FF", 
    fire: "#FF4400", 
    lake: "#7FDDFF", 
    rock: "#999999",
    soil: "#9B7858",
    grass: "#229922",
};

// const states = ["#3355FF", "#999999", "#9B7858", "#229922", "#FF4400", "#7FDDFF"];

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
            state: states.ocean,
            update: false,
            age: 0,
            daysBurning: 0
        };
    }
}

var cycles = 0;
const cyclesPerDay = 1;
var generatingMap = true;

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIsland();
    drawDays();

    if (++cycles > cyclesPerDay) {
        ++days;

        while(generatingMap)
        {
            generatingMap = generateMap();
        }
        updateIsland();
        cycles = 0;
    }

    requestAnimationFrame(run);
}


// populates the island map with its initial geography
// 
function generateMap() {
    // leave outside border as ocean
    //
    for (var c = 1; c < celCols - 1; c++) {
        for (var r = 1; r < celCols - 1; r++) {

            // default to grass for now to see if this works or not!
            var cel = cels[c][r].state = states.rock;
        }
    }

    return false;
    // var hotspot = cels[getRandomInt(celCols)][getRandomInt(celRows)];
    // hotspot.state = fire;
}



function updateIsland() {
    var factor = 30;
    
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {

            var cel = cels[c][r];
            cel.age++;

            // ocean cels do not change
            // 
            if (cel.state == states.ocean) {
                continue;
            }


            cel.update = cel.age % getRandomInt(factor) == 0;

            if (cel.update) {
                var chance = cel.age % getRandomInt(factor) == 1;
                var seed = getRandomInt(factor * 8) == 0;
                var debris = getRandomInt(factor * 8) == 0;

                if (debris && cel.state == states.rock) {
                    cel.state = states.soil;
                }
                else if (seed && cel.state == states.soil) {
                    cel.state = states.grass;
                }
                else if (cel.state == states.grass && chance) {
                    var burnIt = cel.age % getRandomInt(factor * 30) == 0;
                    var waterIt = cel.age % getRandomInt(factor * 30) == 0;
                    var rabbit = cel.age % getRandomInt(factor * 4) == 0;
                    if (burnIt) {
                        cel.state = states.fire;
                        cel.daysBurning++;
                    }
                    else if (waterIt) {
                        cel.state = states.lake;
                    }
                    else if (rabbit) {
                        // TODO: add rabbit
                        var rabbit = 
                        cel.rabbit++;
                    }
                    else {
                        cel.state == states.grass;
                    }
                }
                else if (cel.state == states.lake && chance) {
                    var grassIt = cel.age % getRandomInt(factor/2) == 0;
                    if (grassIt) {
                        cel.state = states.grass;
                    }
                    
                }
                else if (cel.state == states.fire) {
                    if (cel.daysBurning > 2) {
                        cel.daysBurning = 0;
                        cel.state = states.rock;
                    }
                    else {
                        // why shouldn't my neighbours burn, too? :)
                        if (cel.age % getRandomInt(factor * 5) == 0) {
                            updateMyNeighbours(cel, c, r);
                        }
                        cel.daysBurning++;
                    }
                }
                else {
                    // leave the cel unchanged
                }
                cel.update = false;
            }
        }
    }
}

function updateMyNeighbours(cel, c, r) {

    var neighbours = [
        cels[c][r-1],
        cels[c-1][r],
        cels[c+1][r],
        cels[c][r+1],
    ];

    neighbours.forEach(function(neighbour) {
        if (neighbour.state == states.grass) {
            neighbour.state = states.fire;
        }
    });
}


// https://stackoverflow.com/questions/652106/finding-neighbours-in-a-two-dimensional-array
//
function neighbours(cel, c, r) {
    var neighbours = [];
    for (var cn = Math.max(0, c - 1); cn <= Math.min(c + 1, celCols - 1); cn++) {
        for (var rn = Math.max(0, r - 1); rn <= Math.min(r + 1, celRows - 1); rn++) {
            if (cn !== c || rn !== r) {
                neighbours.push(cels[cn][rn]);
            }
        }
    }
    return neighbours;
}

function Rabbit() {
    this.age = 0;
    this.alive = true;
    this.health = 10;
}

function drawIsland() {
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {
            var cel = cels[c][r];

            cel.x = (c * (celWidth + celPadding)) + celOffsetLeft;
            cel.y = (r * (celHeight + celPadding)) + celOffsetTop;
            ctx.beginPath();
            ctx.rect(cel.x, cel.y, celWidth, celHeight);
            ctx.fillStyle = cel.state;
            ctx.fill();
            ctx.closePath();
            // ctx.font = "8pt Arial";
            // ctx.fillStyle = "black";
            // ctx.fillText("s:" + cel.state + " f:" + cel.factor,
            //     cel.x + 2, cel.y + 20);
            if (cel.daysBurning == 1) {
                ctx.beginPath();
                ctx.rect(cel.x + 2, cel.y + 2, celWidth - 4, celHeight - 4);
                ctx.fillStyle = "yellow";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawDays() {
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Days: " + days, 10, canvas.height - 30);
}

// returns an integer between 0 and less than but not including max
// e.g. getRandomInt(3) -> 0, 1, or 2
//
// Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
//
function getRandomInt(max) {
    return getRandomIntMinMax(0, max);
}


// returns an integer between min and less than but not including max
// e.g. getRandomInt(0, 3) -> 0, 1, or 2
//      getRandomInt(3, 7) -> 3, 4, 5, or 6
function getRandomIntMinMax(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


run();