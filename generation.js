const propertyLineNodeNumber = 6;
const houseEdgeNumber = 7;
const windowSize = 300;
const lineOpacity = 1;
function setup() {
    createCanvas(400, 400);

    const propertyLineNodesUnarranged = generateNonIntersectingPolygon(6, 0.19);
    const propertyLineNodesVectors = rearrangePolygon(
        propertyLineNodesUnarranged
    );
    const propertyLineNodes = p5vectorTo1DArray(propertyLineNodesVectors);

    const accessLine = accessLineGeneration(3);
    console.log("accessLine", accessLine);
    const oneHot = accessIndexToOneHot(accessLine, propertyLineNodeNumber);

    //inputs combine propertyLineNodes and oneHot

    const inputs = propertyLineNodes.concat(oneHot);
    // console.log(inputs);

    propertyLine = createPropertyline(propertyLineNodes, windowSize); //p5.Vector array
    // console.log(normalizedrAreaPerimeteRatio(propertyLine));
    drawPropertyLineAndAccessLine(propertyLine, accessLine);
    drawIndices(propertyLine, accessLine);

    //from here, generate the output set
    const innerContourUnordered = generateNonIntersectingPolygonWithinPolygon(
        houseEdgeNumber,
        0.1,
        propertyLine
    );

    const innerContour = rearrangePolygon(innerContourUnordered);
    drawIndices(innerContour, []);
    console.log("innerContour", innerContour); //p5.Vector array
    //convert innerContour to 1D array, normalized by windowSize
    const outputs = p5vectorTo1DArray(innerContour);
    //normalize the outputs
    outputs.forEach((output, index) => {
        outputs[index] = output / windowSize;
    });
    console.log("outputs", outputs);
    drawPropertyLineAndAccessLine(innerContour, []);
    let randomCentralPoint = createRandomPointInPolygon(innerContour);
    circle(randomCentralPoint.x, randomCentralPoint.y, 5);
    console.log("randomCentralPoint", randomCentralPoint);
    const randomCentralPointArray = p5vectorTo1DArray([randomCentralPoint]);
    outputs.push(randomCentralPointArray[0] / windowSize);
    outputs.push(randomCentralPointArray[1] / windowSize);
    console.log("outputs", outputs);

    //fitness

    let shortestRoute = null;
    let shortestDistance = Infinity;
    let chosenAccessLineIndex = null;
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
            chosenAccessLineIndex = accessLine[i];
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
    //fitness function
    const efficiency = analyseEfficiency(
        innerContour,
        propertyLine,
        doorPosition,
        chosenAccessLineIndex,
        30000,
        0.1,
        false
    );
    console.log("efficiency", efficiency);
}
//
//_________________________
//fitness function
//
function analyseEfficiency(
    vertices,
    propertyLine,
    doorPosition,
    chosenAccessLineIndex,
    samples = 10000,
    enterExitPercentage = 0.1,

    show = false
) {
    console.log("analyseEfficiency Parameters:");
    console.log("vertices", vertices);
    console.log("propertyLine", propertyLine);
    console.log("doorPosition", doorPosition);
    console.log("chosenAccessLineIndex", chosenAccessLineIndex);

    let sumDistance = 0;
    //internal points
    for (let i = 0; i < samples * (1 - enterExitPercentage); i++) {
        const point1 = createRandomPointInPolygon(vertices);
        const point2 = createRandomPointInPolygon(vertices);
        if (!isLineInsidePolygon(point1, point2, vertices)) {
            //if not, use pathfinding to find the shortest path between the two points
            sumDistance += calculatePathDistance(
                simplifiedAStar(point1, point2, vertices, show)
            );
        } else {
            if (show) {
                noFill();
                stroke(255, 0, 0, lineOpacity);
                // drawDashLine(point1, point2, 3);
                line(point1.x, point1.y, point2.x, point2.y);
            }
            const distance = p5.Vector.sub(point1, point2).mag();
            sumDistance += distance;
        }
    }
    console.log("sumDistance middle", sumDistance);
    //from inside to access line
    for (let i = 0; i < samples * enterExitPercentage; i++) {
        const point1 = createRandomPointInPolygon(vertices);
        // noStroke();
        // fill(255, 0, 0);
        // circle(point1.x, point1.y, 5);

        if (!isLineInsidePolygon(point1, doorPosition, vertices)) {
            sumDistance +=
                calculatePathDistance(
                    simplifiedAStar(point1, doorPosition, vertices, show)
                ) +
                distanceToLine(
                    doorPosition,
                    propertyLine[chosenAccessLineIndex],
                    propertyLine[
                        (chosenAccessLineIndex + 1) % propertyLine.length
                    ]
                );
        } else {
            if (show) {
                noFill();
                stroke(255, 0, 0, lineOpacity);
                // drawDashLine(point1, this.doorPosition, 3);
                line(point1.x, point1.y, doorPosition.x, doorPosition.y);
            }
            const distance =
                p5.Vector.sub(point1, doorPosition).mag() +
                distanceToLine(
                    doorPosition,
                    propertyLine[chosenAccessLineIndex],
                    propertyLine[
                        (chosenAccessLineIndex + 1) % propertyLine.length
                    ]
                );

            sumDistance += distance;
        }
    }
    sumDistance += sumDistance;
    // testRounds += samples;
    const area = areaCalculation(vertices);
    console.log("area", area);
    console.log("propertyline area", areaCalculation(propertyLine));
    console.log("sumDistance", sumDistance);
    return (1 / sumDistance) * samples * area ** 0.5;
}
