let houses = [];
const genePool = [];
const propertyLineNodes = [50, 100, 200, 50, 300, 100, 300, 300, 100, 300];
const accessLine = [3, 4]; //accessible segment index or indices in the property line
const propertyLine = createPropertyline(propertyLineNodes);

function setup() {
    createCanvas(1450, 1450);

    noLoop();
    // const genotypeOriginal = createGenotype(propertyLine, 8, 1);

    //     const vertices = sortVertices(genotypeOriginal.splice(8, 1));

    //     console.log("vertices", vertices);
    //   textStair = new Staircase(new p5.Vector(100, 100), 0.2, 50, 10);
    //   textStair.draw();

    //generate a random house within the bounds of the property line
    for (let i = 0; i < 1; i++) {
        const house = new House(createGenotype(propertyLine, 8, 1));
        houses.push(house);
        // house.draw();
        house.analyseEfficiency(30);
    }
    //sort the houses by efficiency
    houses.sort((a, b) => b.efficiency - a.efficiency);
    background(200);
    for (let j = 0; j < 1; j++) {
        for (let i = 0; i < 1; i++) {
            push();
            translate(i * 350, j * 350);
            drawPropertyLineAndAccessLine(propertyLine, accessLine);
            houses[j * 4 + i].draw();
            houses[j * 4 + i].analyseEfficiency(30);
            pop();
        }
    }

    // Save button
    const btnSave = createButton("Save House");
    btnSave.position(10, height + 20);
    btnSave.mousePressed(() => {
        const serializedHouse = house.serialize();
        localStorage.setItem("savedHouse", serializedHouse);
        console.log("House saved");
    });

    // Load button
    const btnLoad = createButton("Load House");
    btnLoad.position(100, height + 20).style("width", "100px");
    btnLoad.mousePressed(() => {
        const savedHouseData = localStorage.getItem("savedHouse");
        if (savedHouseData) {
            house = deserializeHouse(savedHouseData);
            background(200); // Clear the canvas
            drawPropertyLineAndAccessLine(propertyLine, accessLine);
            house.draw();
            console.log("House loaded");
        } else {
            console.log("No house saved in localStorage");
        }
    });
    //add a button to generate a new house
    const btnGenerate = createButton("Generate New House");
    btnGenerate.position(202, height + 20);
    btnGenerate.mousePressed(() => {
        background(200);
        const newGenotype = mutate(house.genotype);
        house = new House(newGenotype);
        console.log("house", house);

        drawPropertyLineAndAccessLine(propertyLine, accessLine);
        house.draw();
        house.analyseEfficiency(1000);
    });
}

// function draw() {
//     frameRate(4);

//     house = new House(mutate(house.genotype), 8);
//     house.draw();
//     drawPropertyLineAndAccessLine(propertyLine, accessLine);
// }

function duplicateAndMutate(house) {
    const newHouse = new House(
        house.floors.length,
        house.randomCentralPoint,
        house.propertyLine,
        house.accessLine
    );
    newHouse.floors = house.floors.map((floor) => {
        return new Floor(floor.vertices, floor.floorNumber);
    });
    newHouse.mutate();
    return newHouse;
}

function createPropertyline(propertyLineNodes) {
    const propertyLine = [];
    for (let i = 0; i < propertyLineNodes.length; i += 2) {
        propertyLine.push(
            new p5.Vector(propertyLineNodes[i], propertyLineNodes[i + 1])
        );
    }
    return propertyLine;
}
