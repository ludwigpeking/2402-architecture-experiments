function drawPropertyLineAndAccessLine(propertyLine, accessLine, color = 0) {
    stroke(color);
    strokeWeight(1);
    for (let i = 0; i < propertyLine.length; i++) {
        const start = propertyLine[i];
        const end = propertyLine[(i + 1) % propertyLine.length];
        drawDashLine(start, end, 3);
    }
    stroke(255, 0, 0);
    strokeWeight(1);
    for (let i = 0; i < accessLine.length; i++) {
        const start = propertyLine[accessLine[i]];
        const end = propertyLine[(accessLine[i] + 1) % propertyLine.length];
        drawDashLine(start, end, 3);
    }
}

function drawDashLine(start, end, dashLength) {
    const direction = p5.Vector.sub(end, start);
    const length = direction.mag();
    const unit = direction.copy().normalize().mult(dashLength);
    const steps = length / dashLength;
    for (let i = 0; i < steps; i += 2) {
        const start1 = p5.Vector.add(start, unit.copy().mult(i));
        const end1 = p5.Vector.add(start1, unit);
        line(start1.x, start1.y, end1.x, end1.y);
    }
}

function drawPolygon(points, closeLoop = false) {
    beginShape();
    for (let i = 0; i < points.length; i++) {
        vertex(points[i].x, points[i].y);
    }
    if (closeLoop) {
        endShape(CLOSE);
    } else {
        endShape();
    }
}

function isPointInPolygon(point, polygon, tolerance = 0.0000001) {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        // Check if point is approximately on the same height as the vertex, allowing for tolerance
        let onEdgeY =
            polygon[i].y > point.y - tolerance !=
            polygon[j].y > point.y + tolerance;
        // Calculate cross product with an added tolerance to effectively widen the edge detection
        let crossProduct =
            ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
                (polygon[j].y - polygon[i].y) +
            polygon[i].x -
            point.x;

        if (onEdgeY && crossProduct < tolerance) {
            isInside = !isInside;
        }
    }
    return isInside;
}

function createRandomPointInPolygon(polygon) {
    // Calculate bounding box
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    for (const vertex of polygon) {
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
    }
    let tryPoint = new p5.Vector(random(minX, maxX), random(minY, maxY));
    while (!isPointInPolygon(tryPoint, polygon)) {
        tryPoint = new p5.Vector(random(minX, maxX), random(minY, maxY));
    }
    return tryPoint;
}

function calculateCentroid(points) {
    let centroid = new p5.Vector(0, 0);
    points.forEach((point) => {
        centroid.add(point);
    });
    centroid.div(points.length);
    return centroid;
}

function sortVertices(vertices) {
    const centroid = calculateCentroid(vertices);
    vertices.sort((a, b) => {
        const angleA = atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
    });
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
    const tolerance = 1e-10; // A small tolerance value
    const denominator =
        (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

    if (Math.abs(denominator) < tolerance) {
        return null; // Lines are parallel or coincident
    }

    const ua =
        ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
        denominator;
    const ub =
        ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
        denominator;

    // Adjusting conditions to exclude exact endpoints with a tolerance
    if (
        ua <= tolerance ||
        ua >= 1 - tolerance ||
        ub <= tolerance ||
        ub >= 1 - tolerance
    ) {
        return null; // Intersection is too close to the endpoints or outside the line segments
    }

    return new p5.Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
}

function calculatePerimeter(vertices) {
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % vertices.length];
        perimeter += p5.Vector.sub(start, end).mag();
    }
    return perimeter;
}

function distanceToLine(point, start, end) {
    const direction = p5.Vector.sub(end, start);
    const normal = new p5.Vector(-direction.y, direction.x);
    normal.normalize();
    pointNew = new p5.Vector(point.x, point.y);
    const v = p5.Vector.sub(pointNew, start);
    const distance = p5.Vector.dot(v, normal);
    return abs(distance);
}

function distanceToEdge(point, start, end) {
    // Convert to p5.Vector for easier calculations
    let startPoint = new p5.Vector(start.x, start.y);
    let endPoint = new p5.Vector(end.x, end.y);
    let pointVector = new p5.Vector(point.x, point.y);

    // Calculate the direction vector of the line
    const lineDirection = p5.Vector.sub(endPoint, startPoint);

    // Project pointVector onto the line direction to find the closest point on the infinite line
    let t =
        p5.Vector.dot(p5.Vector.sub(pointVector, startPoint), lineDirection) /
        lineDirection.magSq();

    // Clamping t between 0 and 1 will ensure the point lies within the segment
    t = Math.max(0, Math.min(1, t));

    // Calculate the closest point on the segment to the point
    const closestPoint = p5.Vector.add(
        startPoint,
        p5.Vector.mult(lineDirection, t)
    );

    // Return the distance between the point and the closest point on the segment
    return p5.Vector.dist(pointVector, closestPoint);
}

function theClosestPointOnEdge(point, start, end) {
    // Convert to p5.Vector for easier calculations
    let startPoint = new p5.Vector(start.x, start.y);
    let endPoint = new p5.Vector(end.x, end.y);
    let pointVector = new p5.Vector(point.x, point.y);

    // Calculate the direction vector of the line
    const lineDirection = p5.Vector.sub(endPoint, startPoint);

    // Project pointVector onto the line direction to find the closest point on the infinite line
    let t =
        p5.Vector.dot(p5.Vector.sub(pointVector, startPoint), lineDirection) /
        lineDirection.magSq();

    // Clamping t between 0 and 1 will ensure the point lies within the segment
    t = Math.max(0, Math.min(1, t));

    // Calculate the closest point on the segment to the point
    const closestPoint = p5.Vector.add(
        startPoint,
        p5.Vector.mult(lineDirection, t)
    );

    return closestPoint;
}

function findIntersection(p1, p2, polygon) {
    const interestions = [];
    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length];
        const intersection = lineIntersect(p1, p2, start, end);
        if (intersection) {
            interestions.push(intersection);
        }
        if (interestions.length > 1) {
            return interestions;
        }
    }
    console.log("No intersection found");
    return null;
}

function findClosestPointInPointsToEdge(points, start, end) {
    let closestPoint = points[0];
    let closestDistance = distanceToEdge(closestPoint, start, end);
    for (let i = 1; i < points.length; i++) {
        const distance = distanceToEdge(points[i], start, end);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = points[i];
        }
    }
    return closestPoint;
}

function drawPerpendicularDashLineFromPointToLine(
    point,
    start,
    end,
    dashLength
) {
    // Calculate direction vector of the line
    const lineDirection = p5.Vector.sub(end, start).normalize();

    // Calculate vector from start to point
    const toPoint = p5.Vector.sub(point, start);

    // Project toPoint onto the line direction to find the closest point on the line
    const projectionLength = toPoint.dot(lineDirection);
    const projection = lineDirection.copy().mult(projectionLength);
    const closestPoint = p5.Vector.add(start, projection);

    // Calculate the perpendicular direction from the closest point to the point
    const perpendicularDirection = p5.Vector.sub(point, closestPoint);

    // Calculate the number of dashes based on the perpendicular distance
    const distance = perpendicularDirection.mag();
    const dashSpace = dashLength * 2; // Considering both dash and space have the same length
    const numberOfDashes = Math.floor(distance / dashSpace);

    // Draw dashes
    for (let i = 0; i < numberOfDashes; i++) {
        const dashStart = p5.Vector.add(
            closestPoint,
            perpendicularDirection.copy().setMag(i * dashSpace)
        );
        const dashEnd = p5.Vector.add(
            dashStart,
            perpendicularDirection.copy().setMag(dashLength)
        );

        line(dashStart.x, dashStart.y, dashEnd.x, dashEnd.y);
    }
}

//text if a line is inside a polygon, iterate through all the edges of the polygon and check if the line intersects with any of them
function isLineInsidePolygon(start, end, polygon) {
    for (let i = 0; i < polygon.length; i++) {
        const startEdge = polygon[i];
        const endEdge = polygon[(i + 1) % polygon.length];
        if (lineIntersect(start, end, startEdge, endEdge)) {
            return false;
        }
    }
    //check the middle point of the line is inside the polygon
    const middle = p5.Vector.lerp(start, end, 0.5);
    if (!isPointInPolygon(middle, polygon)) {
        return false;
    }
    return true;
}

function simplifiedAStar(start, goal, polygon, show = false) {
    // console.log("start", start, "goal", goal, "polygon", polygon);
    const openSet = [start]; // Include all nodes initially
    const closedSet = [];
    const nodes = [start, goal, ...polygon]; // Include all nodes initially
    //reset the g, f, h scores and cameFrom of all nodes
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].g = Infinity;
        nodes[i].f = Infinity;
        nodes[i].h = heuristic(nodes[i], goal);
        nodes[i].cameFrom = null;
    }
    let current = start;
    start.g = 0;
    start.f = start.h;
    const path = [];

    // console.log("nodes", nodes);

    while (openSet.length > 0) {
        // Sort nodes in openSet by fScore and select the one with the lowest fScore
        openSet.sort((a, b) => a.f - b.f);
        current = openSet.shift(); // Remove and get the first element
        closedSet.push(current);
        // If the current node is the goal, reconstruct and return the path
        if (current === goal) {
            // console.log("Path found", " path length", calculatePathDistance(reconstructPath( start, goal)), "direct length", p5.Vector.dist(start, goal));
            noFill();
            stroke(0, 255, 0);
            // line(start.x, start.y, goal.x, goal.y);
            return reconstructPath(start, goal, show);
        }

        // Attempt to move to every other node, checking if the path is inside the polygon
        nodes.forEach((neighbor) => {
            if (
                neighbor === current ||
                closedSet.includes(neighbor) ||
                !isLineInsidePolygon(current, neighbor, polygon)
            ) {
                return;
            } else {
                let tentativeGScore = current.g + heuristic(current, neighbor);
                if (tentativeGScore < neighbor.g) {
                    neighbor.cameFrom = current;
                    neighbor.g = tentativeGScore;
                    neighbor.f = neighbor.g + heuristic(neighbor, goal);
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        });
    }

    // If no path is found, return an empty array
    return path;
}

function simplifiedAStarPointToEdge(start, polygon, edgeIndex, show = true) {
    const openSet = [start]; // Include all nodes initially
    const closedSet = [];
    let goal = calculateClosestPointOnEdge(
        start,
        polygon[edgeIndex],
        polygon[(edgeIndex + 1) % polygon.length]
    );
    const nodes = [start, goal, ...polygon]; // Include all nodes initially
    //reset the g, f, h scores and cameFrom of all nodes
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].g = Infinity;
        nodes[i].f = Infinity;
        nodes[i].h = heuristic(nodes[i], goal);
        nodes[i].cameFrom = null;
    }
    let current = start;
    start.g = 0;
    start.f = start.h;
    const path = [];

    // console.log("nodes", nodes);

    while (openSet.length > 0) {
        // Sort nodes in openSet by fScore and select the one with the lowest fScore
        openSet.sort((a, b) => a.f - b.f);
        current = openSet.shift(); // Remove and get the first element
        closedSet.push(current);
        // If the current node is the goal, reconstruct and return the path
        if (current === goal) {
            // console.log("Path found", " path length", calculatePathDistance(reconstructPath( start, goal)), "direct length", p5.Vector.dist(start, goal));
            noFill();
            stroke(0, 255, 0);
            // line(start.x, start.y, goal.x, goal.y);
            return reconstructPath(start, goal, show);
        }
        goal = calculateClosestPointOnEdge(
            current,
            polygon[edgeIndex],
            polygon[(edgeIndex + 1) % polygon.length]
        );
        //update the goal in case the edge is changed
        nodes[1] = goal;
        //update the properties of the goal
        goal.g = Infinity;
        goal.f = Infinity;
        goal.h = heuristic(goal, current);
        goal.cameFrom = null;
        // Attempt to move to every other node, checking if the path is inside the polygon
        nodes.forEach((neighbor) => {
            if (
                neighbor === current ||
                closedSet.includes(neighbor) ||
                !isLineInsidePolygon(current, neighbor, polygon)
            ) {
                return;
            } else {
                let tentativeGScore = current.g + heuristic(current, neighbor);
                if (tentativeGScore < neighbor.g) {
                    neighbor.cameFrom = current;
                    neighbor.g = tentativeGScore;
                    neighbor.f = neighbor.g + heuristic(neighbor, goal);
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        });
    }

    // If no path is found, return an empty array
    return path;
}

// function simplifiedAStarPointToEdge(start, polygon, edgeIndex, show = true) {
//     // Define the edge as the start and end points based on the edgeIndex
//     const edgeStart = polygon[edgeIndex];
//     const edgeEnd = polygon[(edgeIndex + 1) % polygon.length];

//     // Calculate the closest point on the edge to the start point (perpendicular or endpoint)
//     const closestPointOnEdge = calculateClosestPointOnEdge(
//         start,
//         edgeStart,
//         edgeEnd
//     );

//     // Use the closest point on the edge as the goal for the A* search
//     const goal = closestPointOnEdge;

//     // Now, call the simplified A* algorithm with the new goal
//     return simplifiedAStar(start, goal, polygon, show);
// }

function calculateClosestPointOnEdge(point, edgeStart, edgeEnd) {
    const edgeVector = p5.Vector.sub(edgeEnd, edgeStart);
    const pointVector = p5.Vector.sub(point, edgeStart);
    const edgeLengthSquared = edgeVector.magSq();
    let t = p5.Vector.dot(pointVector, edgeVector) / edgeLengthSquared;
    t = Math.max(0, Math.min(1, t)); // Clamp t to the range [0, 1]
    return p5.Vector.add(edgeStart, p5.Vector.mult(edgeVector, t));
}

// Adjustments to simplifiedAStar and supporting functions may be needed to integrate this approach

function reconstructPath(start, goal, show = false) {
    let current = goal;
    const path = [current];
    while (current !== start) {
        current = current.cameFrom;
        path.push(current);
    }
    // console.log("path", path);
    //draw the path with dash line
    if (show) {
        noFill();
        stroke(0, 255, 0, lineOpacity * 10);
        for (let i = 0; i < path.length - 1; i++) {
            // drawDashLine(path[i], path[i + 1], 5);
            line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
        }
    }

    return path.reverse();
}

function p5vectorTo1DArray(vectorArray) {
    return vectorArray.map((vector) => [vector.x, vector.y]).flat();
}

// calculate the reconstructedPath distance
function calculatePathDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
        distance += p5.Vector.dist(path[i - 1], path[i]);
    }
    return distance;
}

// Example heuristic function (Euclidean distance)
function heuristic(nodeA, nodeB) {
    return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
}

function convert2DArrayTo1D(array) {
    return array.reduce((acc, val) => acc.concat(val), []);
} //ok

function createPropertyline(propertyLineNodes, multiplier = windowSize) {
    const propertyLine = [];
    for (let i = 0; i < propertyLineNodes.length; i += 2) {
        propertyLine.push(
            new p5.Vector(
                propertyLineNodes[i] * multiplier,
                propertyLineNodes[i + 1] * multiplier
            )
        );
    }
    return propertyLine;
} //ok

function accessLineGeneration(number) {
    // return number of integers between 0 and propertyLineNodeNumber-1
    const accessLineIndices = [];
    for (let i = 0; i < number; i++) {
        accessLineIndices.push(
            Math.floor(Math.random() * propertyLineNodeNumber)
        );
    }
    // remove the duplicates
    return accessLineIndices.filter(
        (value, index) => accessLineIndices.indexOf(value) === index
    );
} //ok

//calculate the area of the polygon
function polygonArea(polygon) {
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length;
        area += polygon[i].x * polygon[j].y;
        area -= polygon[j].x * polygon[i].y;
    }
    return Math.abs(area / 2);
} //ok

//calculate the perimeter of the polygon
function polygonPerimeter(polygon) {
    let perimeter = 0;
    for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length;
        perimeter += distance4Values(
            polygon[i].x,
            polygon[i].y,
            polygon[j].x,
            polygon[j].y
        );
    }
    return perimeter;
} //ok

function distance4Values(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
} //ok

//calculation the perimeter and area square root ratio
function normalizedrAreaPerimeteRatio(polygon) {
    return Math.sqrt(polygonArea(polygon)) / polygonPerimeter(polygon);
} //ok

function drawPolygon1(polygon, size) {
    beginShape();
    for (let i = 0; i < polygon.length; i++) {
        vertex(polygon[i].x * size, polygon[i].y * size);
    }
    endShape(CLOSE);
} //ok

function generateRandomVertices(n = 6, rangeX = [0, 1], rangeY = [0, 1]) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
        vertices.push(
            new p5.Vector(
                Math.random() * (rangeX[1] - rangeX[0]) + rangeX[0],
                Math.random() * (rangeY[1] - rangeY[0]) + rangeY[0]
            )
        );
    }
    return vertices;
} //ok

function ccw(A, B, C) {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
} //boolean: counter clockwise, ok

function intersect(A, B, C, D) {
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
} //ok

function checkIntersections(vertices) {
    let numVertices = vertices.length;
    for (let i = 0; i < numVertices; i++) {
        for (let j = 0; j < numVertices; j++) {
            if (
                i !== j &&
                (i + 1) % numVertices !== j &&
                i !== (j + 1) % numVertices
            ) {
                let edge1 = [vertices[i], vertices[(i + 1) % numVertices]];
                let edge2 = [vertices[j], vertices[(j + 1) % numVertices]];
                if (intersect(edge1[0], edge1[1], edge2[0], edge2[1])) {
                    return true;
                }
            }
        }
    }
    return false;
} //ok

function shuffle1(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
} //ok

function generateNonIntersectingPolygon(n = 6, threshould = 0.18) {
    let vertices = generateRandomVertices(n, [0, 1], [0, 1]);
    let attempts = 0;
    while (checkIntersections(vertices) && attempts < 500) {
        shuffle1(vertices);
        attempts++;
    }

    while (
        normalizedrAreaPerimeteRatio(vertices) < threshould &&
        attempts < 1000
    ) {
        vertices = generateNonIntersectingPolygon(n, threshould);
        attempts++;
    }

    return vertices;
}

function generateNonIntersectingPolygonWithinPolygon(
    n = 6,
    threshould = 0.1,
    polygon
) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
        vertices.push(createRandomPointInPolygon(polygon));
    }
    while (checkIntersections(vertices)) {
        shuffle1(vertices);
    }

    while (normalizedrAreaPerimeteRatio(vertices) < threshould) {
        vertices = generateNonIntersectingPolygonWithinPolygon(
            n,
            threshould,
            polygon
        );
    }
    //check if the inner polygon's edges intersect with the outer polygon
    for (let i = 0; i < polygon.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            if (
                lineIntersect(
                    polygon[i],
                    polygon[(i + 1) % polygon.length],
                    vertices[j],
                    vertices[(j + 1) % vertices.length]
                )
            ) {
                return generateNonIntersectingPolygonWithinPolygon(
                    n,
                    threshould,
                    polygon
                );
            }
        }
    }

    return vertices;
}
