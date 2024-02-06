class Staircase {
    constructor(downPoint, direction, length, width, floorNumber) {
        this.downPoint = downPoint;
        this.direction = createVector(length, 0).rotate(direction);
        this.floorNumber = floorNumber;
        this.width = width;
    }
    draw() {
        stroke(0, 0, 0);
        //     drawDashLine(this.downPoint, this.upPoint, 3);
        //width 10, length 50

        const directionPerpendicular = this.direction
            .copy()
            .normalize()
            .mult(this.width / 2)
            .rotate(HALF_PI);
        line(
            this.downPoint.x,
            this.downPoint.y,
            this.downPoint.x + directionPerpendicular.x,
            this.downPoint.y + directionPerpendicular.y
        );
        line(
            this.downPoint.x,
            this.downPoint.y,
            this.downPoint.x - directionPerpendicular.x,
            this.downPoint.y - directionPerpendicular.y
        );
        line(
            this.downPoint.x + directionPerpendicular.x,
            this.downPoint.y + directionPerpendicular.y,
            this.downPoint.x + directionPerpendicular.x + this.direction.x,
            this.downPoint.y + directionPerpendicular.y + this.direction.y
        );
        line(
            this.downPoint.x - directionPerpendicular.x,
            this.downPoint.y - directionPerpendicular.y,
            this.downPoint.x - directionPerpendicular.x + this.direction.x,
            this.downPoint.y - directionPerpendicular.y + this.direction.y
        );
        line(
            this.downPoint.x + directionPerpendicular.x + this.direction.x,
            this.downPoint.y + directionPerpendicular.y + this.direction.y,
            this.downPoint.x - directionPerpendicular.x + this.direction.x,
            this.downPoint.y - directionPerpendicular.y + this.direction.y
        );
        drawDashLine(
            this.downPoint.copy().add(directionPerpendicular),
            this.downPoint.copy().add(this.direction),
            3
        );
        drawDashLine(
            this.downPoint.copy().sub(directionPerpendicular),
            this.downPoint.copy().add(this.direction),
            3
        );
    }
}
