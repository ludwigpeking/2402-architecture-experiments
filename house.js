//genotype structure:
// [v0, v1, v2, v3, v4, v5, v6, v7, v8-stairPosition, v9-stairVector,....vOmega-randomeCentralPoint]
// v0-v7 are the vertices of the ground floor, v10-v17 are the vertices of the first floor, and so on...
// the last vertex is the random central point within the ground floor

function createGenotype(propertyLine, segments = 8, numberOfFloors = 1) {
    const genotype = [];
    const groundfloorGenotype = [];
    for (let i = 0; i < segments; i++) {
        groundfloorGenotype.push(createRandomPointInPolygon(propertyLine));
    }
    sortVertices(groundfloorGenotype);
    if (numberOfFloors > 1) {
        groundfloorGenotype.push(
            createRandomPointInPolygon(groundfloorGenotype)
        ); // staircase position
        groundfloorGenotype.push(p5.Vector.random2D()); //staircase direction
    } else {
        groundfloorGenotype.push(null);
        groundfloorGenotype.push(null);
    }
    genotype.push(groundfloorGenotype);

    for (let j = 1; j < numberOfFloors; j++) {
        const floorGenotype = [];
        for (let i = 0; i < segments; i++) {
            floorGenotype.push(
                createRandomPointInPolygon(genotype[j - 1].slice(0, segments))
            );
        }
        sortVertices(floorGenotype);
        if (numberOfFloors > j + 1) {
            floorGenotype.push(createRandomPointInPolygon(floorGenotype)); //staircase position
            floorGenotype.push(p5.Vector.random2D()); //staircase direction
        } else {
            floorGenotype.push(null);
            floorGenotype.push(null);
        }
        genotype.push(floorGenotype);
    }
    //add the random central point
    genotype.push(createRandomPointInPolygon(genotype[0].slice(0, segments)));

    return genotype;
}

class House {
    constructor(genotype, segments = 8) {
        this.genotype = genotype;
        this.floors = [];
        // console.log("genotype", genotype, "propertyLine", propertyLine);
        this.groundFloor = new Floor(genotype[0], 0, propertyLine);
        this.floors.push(this.groundFloor);
        for (let i = 1; i < genotype.length - 1; i++) {
            this.floors.push(
                new Floor(genotype[i], i, genotype[i - 1].slice(0, segments))
            );
        }
        this.randomCentralPoint = this.genotype[this.genotype.length - 1];
        this.generateGroundFloor();
        this.analyseEfficiency(1000, externalEntranceRate);
    }

    generateGroundFloor() {
        //generate the door position
        const point = this.randomCentralPoint;
        // circle(point.x, point.y, 5);
        let minDistance = Infinity;
        let chosenAccess = 0;
        for (let i = 0; i < accessLine.length; i++) {
            const distance = distanceToLine(
                point,
                propertyLine[accessLine[i]],
                propertyLine[(accessLine[i] + 1) % propertyLine.length]
            );
            if (distance < minDistance) {
                minDistance = distance;
                chosenAccess = i;
            }
        }
        const chosenAccessVector = p5.Vector.sub(
            propertyLine[accessLine[chosenAccess]],
            propertyLine[(accessLine[chosenAccess] + 1) % propertyLine.length]
        );
        this.doorPosition = findIntersection(
            point,
            point
                .copy()
                .add(chosenAccessVector.rotate(HALF_PI).normalize().mult(1000)),
            this.floors[0].vertices
        );

        //find the edge of the accessible edge of property line that is closest to the door position
        let minDistanceToPropertyLine = Infinity;
        this.closestEdge = 0;
        for (let i = 0; i < accessLine.length; i++) {
            const distance = distanceToLine(
                this.doorPosition,
                propertyLine[accessLine[i]],
                propertyLine[(accessLine[i] + 1) % propertyLine.length]
            );
            if (distance < minDistanceToPropertyLine) {
                minDistanceToPropertyLine = distance;
                this.closestEdge = i;
                this.currentAccessLine = accessLine[i];
            }
        }

        //draw the perpendicular line from the door position to the current access line

        // console.log("DRAWN");
    }
    analyseEfficiency(testRounds, enterExitPercentage = 0.1, show = false) {
        //two types of tests. first, generate 2 random points in the ground floor
        let sumDistance = 0;

        for (let i = 0; i < testRounds * (1 - enterExitPercentage); i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            const point2 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            if (
                !isLineInsidePolygon(point1, point2, this.groundFloor.vertices)
            ) {
                //if not, use pathfinding to find the shortest path between the two points
                sumDistance += calculatePathDistance(
                    simplifiedAStar(point1, point2, this.groundFloor.vertices)
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
        for (let i = 0; i < testRounds * enterExitPercentage; i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            // noStroke();
            // fill(255, 0, 0);
            // circle(point1.x, point1.y, 5);

            if (
                !isLineInsidePolygon(
                    point1,
                    this.doorPosition,
                    this.groundFloor.vertices
                )
            ) {
                sumDistance +=
                    calculatePathDistance(
                        simplifiedAStar(
                            point1,
                            this.doorPosition,
                            this.groundFloor.vertices
                        )
                    ) +
                    distanceToLine(
                        this.doorPosition,
                        propertyLine[accessLine[0]],
                        propertyLine[(accessLine[0] + 1) % propertyLine.length]
                    );
            } else {
                if (show) {
                    noFill();
                    stroke(255, 0, 0, lineOpacity);
                    // drawDashLine(point1, this.doorPosition, 3);
                    line(
                        point1.x,
                        point1.y,
                        this.doorPosition.x,
                        this.doorPosition.y
                    );
                }
                const distance =
                    p5.Vector.sub(point1, this.doorPosition).mag() +
                    distanceToLine(
                        this.doorPosition,
                        propertyLine[accessLine[0]],
                        propertyLine[(accessLine[0] + 1) % propertyLine.length]
                    );

                sumDistance += distance;
            }
        }

        // console.log("sumDistance", sumDistance);
        this.efficiency =
            (1 / (sumDistance / sqrt(this.groundFloor.area))) * testRounds;

        // console.log("Efficiency", this.efficiency);
    }

    draw() {
        this.floors.forEach((floor) => {
            floor.draw();
        });
        noStroke();
        fill(0, 0, 255);
        circle(this.randomCentralPoint.x, this.randomCentralPoint.y, 5);
        circle(this.doorPosition.x, this.doorPosition.y, 10);
        //draw perpendicular line
        noFill();
        stroke(255, 0, 0);

        drawPerpendicularDashLineFromPointToLine(
            this.doorPosition,
            propertyLine[accessLine[this.closestEdge]],
            propertyLine[
                (accessLine[this.closestEdge] + 1) % propertyLine.length
            ],
            3
        );
        noStroke();
        fill(this.efficiency * 255 - 255, 0, 0);
        textSize(15);
        text("Efficiency: " + round(this.efficiency, 2), 50, 320);
    }
    #generateStaircases() {}
    // mutate() {
    //     //a vector in the genotype will be replaced by a new random vector, test the validity of the new genotype, if valid, replace the old genotype with the new one
    // }
}

function mutate(genotype) {
    let isValid = false; // Flag to track if the new genotype is valid
    let newGenotype = [];
    let attempts = 0; // To prevent infinite loop

    const levelNumber = genotype.length - 1;
    const segments = genotype[0].length - 2;
    const flattenedGenotype = genotype.slice(0).flat(2);

    while (!isValid && attempts < 1000) {
        // Limit attempts to avoid infinite loop
        // Flatten all the elements in the genotype array layers

        const randomIndex = floor(random(0, flattenedGenotype.length));
        const randomMove = p5.Vector.random2D().mult(random(1, 100));
        // const randomPoint = createRandomPointInPolygon(propertyLine);
        if (flattenedGenotype[randomIndex] !== null) {
            let vectorCopy = flattenedGenotype[randomIndex]
                .copy()
                .add(randomMove);

            // Now, use vectorCopy instead of directly modifying the original vector
            flattenedGenotype[randomIndex] = vectorCopy;
            // console.log(
            //     "randomIndex",
            //     randomIndex,
            //     "randomPoint",
            //     randomPoint,
            //     "flattenedGenotype[randomIndex]",
            //     flattenedGenotype[randomIndex]
            // );

            //sort the polygon vertices of each floor
            for (let i = 0; i < levelNumber; i++) {
                let toSort = flattenedGenotype.slice(
                    i * (segments + 2),
                    (i + 1) * (segments + 2) - 2
                );
                sortVertices(toSort);
                for (let j = 0; j < toSort.length; j++) {
                    flattenedGenotype[i * (segments + 2) + j] = toSort[j];
                }
            }

            newGenotype = [];
            for (let i = 0; i < levelNumber; i++) {
                //use sortVertices to sort the segement number of vertices of each floor

                newGenotype.push(
                    flattenedGenotype.slice(
                        i * (segments + 2),
                        (i + 1) * (segments + 2)
                    )
                );
                // sortVertices(newGenotype[i].slice(0, segments));
            }
            // console.log("flattenedGenotype", flattenedGenotype);
            newGenotype.push(flattenedGenotype.slice(-1)[0]); // Ensure the last element is included correctly

            // Check the validity of the new genotype
            isValid = true; // Assume valid until proven otherwise
            for (let i = 0; i < segments; i++) {
                if (!isPointInPolygon(newGenotype[0][i], propertyLine)) {
                    isValid = false;
                }
            }

            for (let i = 1; i < levelNumber && isValid; i++) {
                for (let j = 0; j < segments; j++) {
                    if (
                        !isPointInPolygon(newGenotype[i][j], newGenotype[i - 1])
                    ) {
                        isValid = false;
                    }
                }
            }
            if (
                !isPointInPolygon(
                    newGenotype[newGenotype.length - 1],
                    newGenotype[0].slice(0, segments)
                )
            ) {
                isValid = false;
            }
        }
        attempts++;
    }
    // console.log("IsValid", isValid);
    // Return the original genotype if a valid mutation wasn't found
    // Otherwise, return the valid new genotype
    return isValid ? newGenotype : genotype;
}

House.prototype.serialize = function () {
    // Serialize only the data, not methods
    const data = {
        floorNumber: this.floorNumber,
        // Assume other properties are serializable; otherwise, you need to handle them appropriately
        propertyLine: this.propertyLine.map((v) => ({ x: v.x, y: v.y })),
        accessLine: this.accessLine,
        floors: this.floors.map((floor) => ({
            validArea: floor.validArea.map((v) => ({ x: v.x, y: v.y })),
            level: floor.level,
            vertices: floor.vertices.map((v) => ({ x: v.x, y: v.y })),
            area: floor.area,
        })),
        staircases: this.staircases,
        // Include other properties as needed
    };
    console.log(data);
    return JSON.stringify(data);
};

function deserializeHouse(data) {
    const obj = JSON.parse(data);
    const house = new House(
        obj.floorNumber,
        obj.staircases,
        obj.propertyLine.map((v) => new p5.Vector(v.x, v.y)),
        obj.accessLine
    );
    house.floors = obj.floors.map((floor) => {
        const f = new Floor(floor.validArea, floor.level);
        f.vertices = floor.vertices.map((v) => new p5.Vector(v.x, v.y));
        f.area = floor.area;
        return f;
    });
    // Set any additional properties if necessary
    return house;
}

class Floor {
    constructor(floorGenotype, level, validArea) {
        this.validArea = validArea;
        this.level = level;
        this.vertices = floorGenotype.slice(0, floorGenotype.length - 2);
        this.area = areaCalculation(this.vertices);
        this.perimeter = calculatePerimeter(this.vertices);
    }

    draw() {
        fill(255 - this.level * 50);
        stroke(0, 0, 0);
        drawPolygon(this.vertices, true);
    }
}

function mutateVertexWithinProperty(vertex, propertyLine) {
    let mutatedVertex;
    let attempts = 0;
    do {
        // Small, controlled random movement
        const movement = p5.Vector.random2D().mult(random(1, 10)); // Adjust the range as needed
        mutatedVertex = vertex.copy().add(movement);
        attempts++;
    } while (!isPointInPolygon(mutatedVertex, propertyLine) && attempts < 100);

    return attempts < 100 ? mutatedVertex : vertex; // Return mutated vertex if valid, else original
}
