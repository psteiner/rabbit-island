// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;
var years = 0;
var decadalCycle = 10;
var decadalOscillation = decadalCycle / 2;
const daysPerYear = 365;
var isRainySeason = false;

// cels
var celRows = 25;
var celCols = 25;
var celPadding = 1;
var celWidth = 20;
var celHeight = 20;
var celOffsetLeft = (canvas.width - celRows * celWidth) / 2;
var celOffsetTop = (canvas.height - celCols * celHeight) / 2;

var celStats = false;
var grassCels = 0;
var maxGrassCels = 0;
var minGrassCels = celCols * celRows;

const MAX_RABBITS = 8;
var rabbitPop = 0;

const MAX_FOXES = 2;
var foxPop = 0;

const states = {
    ocean: "#3355FF",
    fire: "#FF4400",
    lake: "#7FDDFF",
    rock: "#999999",
    soil: "#9B7858",
    grass: "#229922",
    straw: "#f4ce42"
};

var cycles = 0;
const cyclesPerDay = 1;
var isRunning = true;

var generatingMap = true;

// initialize the island map
//
var cels = [];

for (var c = 0; c < celCols; c++) {
    cels[c] = [];
    for (var r = 0; r < celRows; r++) {
        cels[c][r] = {
            x: 0,
            y: 0,
            state: states.ocean, 
            daysBurning: 0,
            moisture: 100,
            isHabitable: false, // rock, soil, straw or grass
            isShoreline: false,
            forage: 100, // what rabbits eat
            rabbits: [],
            foxes: []
        };
    }
}

window.onmousedown = function () {
    isRunning = !isRunning;
};

document.addEventListener("keydown", (event) => {
    switch (event.code) {
    case "KeyC":
        celStats = !celStats;
        break;
    }
});

function run() {
    if (isRunning) {
        update();
    }
    requestAnimationFrame(run);
}


function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIsland();
    drawLegend();

    if (++cycles > cyclesPerDay) {
        // cycle 360 days per year
        days = days % daysPerYear + 1;
        if (days == daysPerYear) {
            years++;
            if (years % (decadalCycle * 2) < decadalCycle) {
                // decadalOscillation = years % 10;
                decadalOscillation--;
            } else {
                // decadalOscillation = 10 - years % 10;
                decadalOscillation++;
            }
        }


        // decadalOscillation *= 0.1;

        // while (generatingMap) {
        //     generatingMap = generateMap();
        // }

        updateIsland();

        cycles = 0;
    }
}

// populates the island map with its initial geography
// 
function generateMap() {
    // leave outside border as ocean
    //
    var oceanBorder = 2;
    for (var c = oceanBorder; c < celCols - oceanBorder; c++) {
        for (var r = oceanBorder; r < celCols - oceanBorder; r++) {
            var cel = cels[c][r];
            cel.state = states.rock;
            cel.c = c;
            cel.r = r;
            cel.moisture = 0;
        }
    }

    return false;
}


function iterateIsland(action) {

    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {

            var cel = cels[c][r];

            // ocean cels do not change, for now
            // 
            if (cel.state == states.ocean) {
                continue;
            }

            action(cel);
        }
    }
}

/*  European Rabbit - https://en.wikipedia.org/wiki/European_rabbit
    lifespan: 2 years (730 days)
    Breeding Season: January to August
    Reproduction Period: 30 to 50 days
    litter size: 3 to 7 kittens
    Gestation Period: 30 days
    weans: 21 days
    sexual maturity: 120 days
    matures: 150 days
    warrens contain 2 to 10 individuals

    Factory Function - 
    https://www.theodinproject.com/courses/javascript/lessons/factory-functions-and-the-module-pattern
*/
function Rabbit() {
    this.lifespan = 730;
    this.breedingSeasonStart = 0;
    this.breedingSeasonEnd = 220;
    this.age = 150;      // arrives on the island as a mature adult
    this.health = 10;   // dies when 0
    this.stamina = 10;  // each cel move costs 1 stamina
    this.hunger = 0;    // eats 1 forage per day
}

function Buck() {
    Rabbit.call();
    this.sex = "male";
}

function Doe() {
    Rabbit.call();
    this.sex = "female";
    this.isPregnant = false;
    this.litter = [];
}

/*  Red Fox - https://en.wikipedia.org/wiki/Red_fox
    Lifespan: 
    Reproduction Period: 365 days
    Breeding Season: Spring
    Litter Size: 4 to 6
    Gestation Period: 50 days

*/
function Fox() {
    this.sex = getRandomInt(2) == 0 ? "male" : "female";
    this.age = 3;       // dies at age 10
    this.health = 10;   // dies when 0
    this.stamina = 10;  // each cel move costs 1 stamina
    this.hunger = 0;    // eats 1 rabbit every 3 days
}


function updateIsland() {

    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {

            var cel = cels[c][r];

            // ocean cels do not change, for now
            // 
            if (cel.state == states.ocean) {
                continue;
            }



            // randomize cell updates
            var skip = getRandomInt(3);

            if (skip == 0) {
                continue;
            }

            var weather = getRandomInt(2) == 0;

            if (days < daysPerYear / 2) {
                isRainySeason = true;
                if (weather && cel.moisture < 100) {
                    cel.moisture++;
                }
            } else {
                isRainySeason = false;
                if (weather && cel.moisture > 0) {
                    cel.moisture--;
                }
                if (grassCels < minGrassCels) {
                    minGrassCels = grassCels;
                }
            }
            if (grassCels > maxGrassCels) {
                maxGrassCels = grassCels;
            }


            // chance that a seed lands on a cell
            //
            var seed = getRandomInt(10 + decadalOscillation) == 0;

            // chance that organic debris accumulates on a cell
            //
            var debris = getRandomInt(70 + decadalOscillation) == 0;

            
            // add rabbits
            if (getRandomInt(100 + decadalOscillation) == 0) {
                var rabbit = new Rabbit();
                rabbitPop++;

                if (cel.rabbits.length < MAX_RABBITS && cel.isHabitable) {
                    cel.rabbits.push(rabbit);
                }
                else {
                    moveRabbitToNeighbour(rabbit, cel);
                }
            }

            // add foxes
            if (getRandomInt(100 + decadalOscillation) == 0) {
                var fox = new Fox();
                foxPop++;

                if (cel.foxes.length < MAX_FOXES && cel.isHabitable) {
                    cel.foxes.push(fox);
                }
                else {
                    moveFoxToNeighbour(fox, cel);
                }
            }

            // default to inhabitable, then set to true for 
            // rock, soil, straw or grass
            cel.isHabitable = false;
            if (cel.state == states.rock && debris) {
                cel.state = states.soil;
                cel.isHabitable = true;
            } else if (cel.state == states.soil && seed && cel.moisture > 25) {
                grassCels++;
                cel.state = states.grass;
                cel.isHabitable = true;
            } else if (cel.state == states.grass) {
                if (cel.moisture > 90) {
                    cel.state = states.lake;
                    grassCels--;
                } else if (cel.moisture < 10) {
                    cel.state = states.straw;
                    cel.isHabitable = true;
                    grassCels--;
                }
            } else if (cel.state == states.straw) {
                if (cel.moisture < 5) {
                    cel.state = states.fire;
                    cel.moisture = 0;
                    // aww, the poor animals 
                    rabbitPop -= cel.rabbits.length + 1;
                    cel.rabbits.length = 0;
                    foxPop -= cel.foxes.length + 1;
                    cel.foxes.length = 0;
                    cel.daysBurning++;
                }
            } else if (cel.state == states.lake) {
                if (cel.moisture < 50) {
                    cel.state = states.grass;
                    cel.isHabitable = true;
                    grassCels++;
                }
            } else if (cel.state == states.fire) {
                if (cel.daysBurning > 1) {
                    cel.daysBurning = 0;
                    cel.state = states.rock;
                    cel.isHabitable = true;
                } else {
                    // why shouldn't my neighbours burn, too? :)
                    updateMyNeighbours(cel, c, r);
                    cel.daysBurning++;
                }
            } else {
                // leave the cel unchanged
            }
        }
    }
}

function updateMyNeighbours(cel, c, r) {

    var neighbours = [
        cels[c][r - 1],
        cels[c - 1][r],
        cels[c + 1][r],
        cels[c][r + 1],
    ];

    neighbours.forEach(function (neighbour) {
        if (neighbour.state == states.straw) {
            neighbour.state = states.fire;
        }
    });
}


// https://stackoverflow.com/questions/652106/finding-neighbours-in-a-two-dimensional-array
//
function getNeighbours(cel) {
    var neighbours = [];

    for (var cn = Math.max(0, cel.c - 1); cn <= Math.min(cel.c + 1, celCols - 1); cn++) {
        for (var rn = Math.max(0, cel.r - 1); rn <= Math.min(cel.r + 1, celRows - 1); rn++) {
            if (cn !== cel.c || rn !== cel.r) {
                neighbours.push(cels[cn][rn]);
            }
        }
    }
    return neighbours;
}

function moveRabbitToNeighbour(rabbit, cel) {
    var neighbours = getNeighbours(cel);
    var didMove = false;

    neighbours.forEach(function (neighbour) {
        if (didMove == false && neighbour.rabbits.length < MAX_RABBITS && neighbour.isHabitable) {
            neighbour.rabbits.push(rabbit);
            didMove = true;
        }
    });

    return didMove;
}

function moveFoxToNeighbour(fox, cel) {
    var neighbours = getNeighbours(cel);
    var didMove = false;

    neighbours.forEach(function (neighbour) {
        if (didMove == false && neighbour.foxes.length < MAX_FOXES && neighbour.isHabitable) {
            neighbour.foxes.push(fox);
            didMove = true;
        }
    });

    return didMove;
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

            if (celStats) {
                ctx.font = "7pt Arial";
                ctx.fillStyle = "black";
                ctx.fillText(cel.moisture, cel.x + 4, cel.y + 13);
            }

            if (cel.daysBurning == 1) {
                ctx.beginPath();
                ctx.rect(cel.x + 2, cel.y + 2, celWidth - 4, celHeight - 4);
                ctx.fillStyle = "yellow";
                ctx.fill();
                ctx.closePath();
            }

            if (cel.rabbits.length > 0) {
                ctx.font = "7pt Arial";
                ctx.fillStyle = "yellow";
                ctx.fillText(cel.rabbits.length, cel.x + 2, cel.y + 13);
            }

            if (cel.foxes.length > 0) {
                ctx.font = "7pt Arial";
                ctx.fillStyle = "red";
                ctx.fillText(cel.foxes.length, cel.x + 10, cel.y + 13);
            }
        }
    }
}

function drawLegend() {
    ctx.font = "10pt Consolas";
    ctx.fillStyle = "black";
    var avgOffset = 140;
    var maxOffset = 200;
    var totalOffset = 250;
    var leading = 14;
    var line1 = canvas.height - 8;
    var line2 = line1 - leading;
    var line3 = line2 - leading;

    ctx.fillText("Rainy: " + isRainySeason, 400, line3);
    ctx.fillText("Dec Osc: " + decadalOscillation, 10, line3);
    ctx.fillText("Curr Grass: " + grassCels, 200, line3);

    ctx.fillText("Days:  " + days, 10, line2);
    ctx.fillText("Min Grass: " + minGrassCels, 200, line2);
    ctx.fillText("Rabbits: " + rabbitPop, 400, line2);
    
    ctx.fillText("Years: " + years, 10, line1);
    ctx.fillText("Max Grass: " + maxGrassCels, 200, line1);
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

generateMap();

// identify shoreline cels
//
iterateIsland(function(cel) {
    var neighbours = getNeighbours(cel);

    neighbours.forEach(function (neighbour) {
        if (neighbour.state == states.ocean) {
            cel.isShoreline = true;
        }
    });

});

run();