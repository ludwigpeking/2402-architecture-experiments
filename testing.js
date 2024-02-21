const propertyLineNodeNumber = 6;
let house;
let propertyLine;
let accessLine;
let newInnerCountour;

const lineOpacity = 50;

function setup() {
    createCanvas(400, 400);
    background(200);

    const propertyLineNodes = p5vectorTo1DArray(
        generateNonIntersectingPolygon(6, 0.19)
    );
    accessLine = accessLineGeneration(3);
    console.log(accessLine.length);
    propertyLine = createPropertyline(propertyLineNodes, 400); //p5.Vector array
    console.log(normalizedrAreaPerimeteRatio(propertyLine));
    drawPropertyLineAndAccessLine(propertyLine, accessLine);

    let innerContour = generateNonIntersectingPolygonWithinPolygon(
        6,
        0.19,
        propertyLine
    );

    console.log(normalizedrAreaPerimeteRatio(innerContour));
    console.log("innerContour", innerContour);
    drawPropertyLineAndAccessLine(innerContour, []);

    let randomCentralPoint = createRandomPointInPolygon(innerContour);
    circle(randomCentralPoint.x, randomCentralPoint.y, 5);

    let shortestRoute = null;
    let shortestDistance = Infinity;
    for (let i = 0; i < accessLine.length; i++) {
        const route = simplifiedAStarPointToEdge(
            randomCentralPoint,
            propertyLine,
            accessLine[i],
            false
        );
        if (calculatePathDistance(route) < shortestDistance) {
            shortestRoute = route;
            shortestDistance = calculatePathDistance(route);
        }
    }

    drawPolygon(shortestRoute);
    //check the route's intersection with the inner contour
    const intersectPositions = [];
    let doorPosition = null;
    for (let i = 0; i < innerContour.length; i++) {
        for (let j = 0; j < shortestRoute.length; j++) {
            if (
                lineIntersect(
                    innerContour[i],
                    innerContour[(i + 1) % innerContour.length],
                    shortestRoute[j],
                    shortestRoute[(j + 1) % shortestRoute.length]
                )
            ) {
                intersectPositions.push(
                    lineIntersect(
                        innerContour[i],
                        innerContour[(i + 1) % innerContour.length],
                        shortestRoute[j],
                        shortestRoute[(j + 1) % shortestRoute.length]
                    )
                );
            }
        }
    }
    //compare which intersectPosition is furthest from the central point
    let furthestDistance = 0;
    for (let i = 0; i < intersectPositions.length; i++) {
        if (
            p5.Vector.dist(randomCentralPoint, intersectPositions[i]) >
            furthestDistance
        ) {
            furthestDistance = p5.Vector.dist(
                randomCentralPoint,
                intersectPositions[i]
            );
            doorPosition = intersectPositions[i];
        }
    }

    if (doorPosition) {
        fill(255, 0, 0);
        noStroke();
        circle(doorPosition.x, doorPosition.y, 5);
    }

    // let intersection = intersectionOfPolygons(shortestRoute, innerContour);

    // house = new House(createGenotype(propertyLine, 8, 1), 0);
    // house.draw();
    // newInnerCountour = testMutate(innerContour);
    // drawPropertyLineAndAccessLine(newInnerCountour, []);
}

// function draw() {
//     frameRate(0.6);
//     background(200);
//     drawPropertyLineAndAccessLine(newInnerCountour, [], 150);
//     newInnerCountour = testMutate(newInnerCountour);
//     stroke(0, 0, 255);
//     drawPropertyLineAndAccessLine(newInnerCountour, [], 50);
//     drawPropertyLineAndAccessLine(propertyLine, accessLine);
// }

function testMutate(genotype) {
    let newGenotype = [];
    const segments = genotype.length;

    let vectorCopy;
    let randomIndex;
    let attempts = 0;
    let isValid = false;
    while (!isValid && attempts < 100) {
        isValid = true;
        randomIndex = floor(random(0, segments));
        const randomMove = p5.Vector.random2D().mult(random(0, 100));
        vectorCopy = genotype[randomIndex].copy().add(randomMove);
        if (!isPointInPolygon(vectorCopy, propertyLine)) {
            isValid = false;
        } else {
            newGenotype = genotype.slice(0);
            newGenotype[randomIndex] = vectorCopy;
        }
        do {
            shuffle1(newGenotype);
            attempts++;
        } while (checkIntersections(newGenotype) && !isValid);
        attempts++;
    }

    fill(0, 0, 255);
    circle(genotype[randomIndex].x, genotype[randomIndex].y, 10);

    fill(255, 0, 255);
    circle(vectorCopy.x, vectorCopy.y, 10);

    return newGenotype;
}
