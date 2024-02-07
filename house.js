class House {
    constructor(floorNumber, staircases, propertyLine, accessLine) {
        this.floorNumber = floorNumber;
        this.floors = [];
        this.floors.push(new Floor(propertyLine, 0));
        this.staircases = staircases;
        this.propertyLine = propertyLine;
        this.accessLine = accessLine;
        this.floors = [];
        this.staircases = [];
        this.#generateGroundFloor();
        for (let i = 1; i < floorNumber; i++) {
            this.floors.push(new Floor(propertyLine, i));
        }

        if (this.floorNumber > 1) {
            this.#generateStaircases();
        }
        this.#analyseEfficiency();
    }
    #analyseEfficiency() {
        //iterate 1000 times, generate 2 random points in the ground floor
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            noStroke();
            fill(255, 0, 0);
            circle(point1.x, point1.y, 5);
            const point2 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
        }
    }
    draw() {
        this.floors.forEach((floor) => {
            floor.draw();
        });
    }
    #generateGroundFloor() {
        this.groundFloor = new Floor(this.propertyLine, 0);
        this.floors.push(this.groundFloor);
        //generate a random point in the ground floor, then draw a perpendicular line to each of the access lines, which is closer to the point will count. then the perpendicular line's intersection with ground floor edge will be defined as the door position
        const point = createRandomPointInPolygon(this.groundFloor.vertices);
        let closestDistance = Infinity;
        let closestPoint;
        for (let i = 0; i < this.accessLine.length; i++) {
            const start = this.propertyLine[this.accessLine[i]];
            const end =
                this.propertyLine[
                    (this.accessLine[i] + 1) % this.propertyLine.length
                ];
            const direction = p5.Vector.sub(end, start);
            const length = direction.mag();
            const unit = direction.copy().normalize();
            const perpendicular = createVector(-unit.y, unit.x);
            const intersection = lineIntersect(
                point,
                p5.Vector.add(point, perpendicular),
                start,
                end
            );
            if (intersection) {
                const distance = p5.Vector.sub(point, intersection).mag();
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = intersection;
                }
            }
        }
        //iterate the ground floor edge, find the intersection point between the perpendicular line and the only intersected edge
        let doorPosition;
        for (let i = 0; i < this.groundFloor.vertices.length; i++) {
            const start = this.groundFloor.vertices[i];
            const end =
                this.groundFloor.vertices[
                    (i + 1) % this.groundFloor.vertices.length
                ];
            const intersection = lineIntersect(point, closestPoint, start, end);
            if (intersection) {
                doorPosition = intersection;
                break;
            }
        }

        //draw the door with blue point
        noStroke();
        fill(0, 0, 255);
        circle(this.doorPosition.x, this.doorPosition.y, 5);
    }
    #generateStaircases() {}
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
        obj.propertyLine.map((v) => createVector(v.x, v.y)),
        obj.accessLine
    );
    house.floors = obj.floors.map((floor) => {
        const f = new Floor(floor.validArea, floor.level);
        f.vertices = floor.vertices.map((v) => createVector(v.x, v.y));
        f.area = floor.area;
        return f;
    });
    // Set any additional properties if necessary
    return house;
}

class Floor {
    constructor(validArea, level) {
        this.validArea = validArea;
        this.level = level;
        this.vertices = [];
        this.#generateRandomVertices();
        this.area = areaCalculation(this.vertices);
    }

    #generateRandomVertices() {
        let attempts = 0;
        while (this.vertices.length < 8 && attempts < 1000) {
            const point = createRandomPointInPolygon(this.validArea);
            this.vertices.push(point);
            attempts++;
        }
        sortVertices(this.vertices); //sort vertices in clockwise order
    }

    draw() {
        fill(255, 255, 255, 100);
        stroke(0, 0, 0);
        drawPolygon(this.vertices, true);
    }
}

function areaCalculation(vertices) {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        const vertex1 = vertices[i];
        const vertex2 = vertices[(i + 1) % vertices.length];
        area += (vertex2.x - vertex1.x) * (vertex2.y + vertex1.y);
    }
    return Math.abs(area / 2);
}

//function to test if two edges interest each other
function lineIntersect(p1, p2, p3, p4) {
    const denominator =
        (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0) {
        return null;
    }
    const ua =
        ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
        denominator;
    const ub =
        ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
        denominator;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }
    return createVector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
}
