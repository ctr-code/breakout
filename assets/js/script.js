
// Use a function to avoid polluting the global namespace
(function () {
    "use strict";

    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        magnitudeSquared() {
            return this.x * this.x + this.y * this.y;
        }

        magnitude() {
            return Math.sqrt(this.magnitudeSquared());
        }

        unit() {
            const m = this.magnitude();
            return new Vector2(this.x / m, this.y / m);
        }

        normal() {
            return new Vector2(this.y, -this.x);
        }

        add(that) {
            return new Vector2(this.x + that.x, this.y + that.y);
        }

        sub(that) {
            return new Vector2(this.x - that.x, this.y - that.y);
        }

        mul(c) {
            return new Vector2(this.x * c, this.y * c);
        }

        dot(that) {
            return this.x * that.x + this.y * that.y;
        }
    }

    class Line {
        constructor(p1, p2) {
            this.p1 = p1;
            this.p2 = p2;
        }

        /**
         * return undefined or distance from p to the intersection with this Line.
         * This doesn't check that the intersection lies within the endpoints.
         * @param {starting point} p
         * @param {direction} v
         */
        intersection(p, v) {
            const n = this.p2.sub(this.p1).normal();
            const d = n.dot(v);
            if (Math.abs(d) < 0.0001) {
                return undefined;
            }
            const t = this.p1.sub(p).dot(n) / d;
            return t;
        }

        unitNormal() {
            return this.p1.sub(this.p2).unit().normal();
        }
    }

    class Circle {
        constructor(c, r) {
            this.c = c;
            this.r = r;
        }

        intersection(p, v) {
            const vsq = v.magnitudeSquared();
            const p2 = p.sub(this.c);
            const dot = p2.dot(v);
            const D = dot * dot - vsq * (p2.magnitudeSquared() - this.r * this.r);
            if (D <= 0) {
                return undefined;
            }
            const t1 = (-dot - Math.sqrt(D)) / vsq;
            const t2 = (-dot + Math.sqrt(D)) / vsq;
            if (t1 > 0) {
                return t1;
            } else if (t2 > 0) {
                return t2;
            } else {
                return undefined;
            }
        }

        unitNormal(target) {
            return target.sub(this.c).unit();
        }
    }

    const xsize = 45;
    const ysize = 40;
    const scale = 15;

    let container,
        bat,
        bricks,
        ball,
        leftPressed = false,
        rightPressed = false;

    document.addEventListener("DOMContentLoaded", function () {
        container = document.getElementById("game");
        container.style.width = (xsize * scale) + "px";
        container.style.height = (ysize * scale) + "px";

        document.addEventListener("keydown", function (e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.repeat) {
                if (e.key === "z") {
                    leftPressed = true;
                } else if (e.key === "x") {
                    rightPressed = true;
                }
                manageBat();
            }
        });

        document.addEventListener("keyup", function (e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.repeat) {
                if (e.key === "z") {
                    leftPressed = false;
                } else if (e.key === "x") {
                    rightPressed = false;
                }
                manageBat();
            }
        });

        initialiseBat();
        initialiseBricks();
        initialiseBall();
    });

    function positionDiv(item) {
        item.div.style.left = (item.x * scale) + "px";
        item.div.style.top = (item.y * scale) + "px";
        item.div.style.width = (item.w * scale) + "px";
        item.div.style.height = (item.h * scale) + "px";
    }

    function makeTranslate(p) {
        return `translate(${p.x * scale}px,${p.y * scale}px)`;
    }

    function makeBallTranslate(p, r) {
        return `translate(${(p.x - r) * scale}px,${(p.y - r) * scale}px)`;
    }

    function initialiseBat() {
        const div = document.createElement("div");
        bat = { p: new Vector2(10, ysize - 3), w: 8, h: 1, div: div };
        div.classList.add("bat");
        div.style.width = (bat.w * scale) + "px";
        div.style.height = (bat.h * scale) + "px";
        div.style.transform = makeTranslate(bat.p);
        container.appendChild(div);
    }

    function initialiseBricks() {
        const brickw = 3;
        const brickh = 2;
        const colCount = Math.floor(xsize / brickw);

        bricks = [];

        for (let row = 0; row != 5; ++row) {
            for (let col = 0; col != colCount; ++col) {
                const div = document.createElement("div");
                let brick = { x: col * brickw, y: (6 - row) * brickh, w: brickw, h: brickh, div: div };
                bricks.push(brick);
                div.classList.add("brick");
                div.classList.add("row" + row);
                div.style.left = (brick.x * scale) + "px";
                div.style.top = (brick.y * scale) + "px";
                div.style.width = (brick.w * scale) + "px";
                div.style.height = (brick.h * scale) + "px";
                container.appendChild(div);
                // Calculate edges
                const p0 = { x: brick.x, y: brick.y };
                const p1 = { x: brick.x + brick.w, y: brick.y };
                const p2 = { x: brick.x + brick.w, y: brick.y + brick.h };
                const p3 = { x: brick.x, y: brick.y + brick.h };
                brick.box = { p0, p1, p2, p3 };
                /*edges.push({ p0: p0, p1: p1, item: brick });
                edges.push({ p0: p1, p1: p2, item: brick });
                edges.push({ p0: p2, p1: p3, item: brick });
                edges.push({ p0: p3, p1: p0, item: brick });*/
            }
        }
    }

    /*function addCircle(x, y, r) {
        const div = document.createElement("div");
        div.classList.add("circ");
        div.style.width = (2 * r * scale) + "px";
        div.style.height = (2 * r * scale) + "px";
        div.style.transform = makeBallTranslate(x, y, r);
        container.appendChild(div);
    }*/
 
    function initialiseBall() {
        const radius = 0.5;
        const div = document.createElement("div");
        ball = { p: new Vector2(xsize - 10, ysize - 3), w: 2 * radius, h: 2 * radius, r: radius, v: new Vector2(-4, -4), div: div };
        div.classList.add("ball");
        div.style.width = (ball.w * scale) + "px";
        div.style.height = (ball.h * scale) + "px";
        div.style.transform = makeBallTranslate(ball.p, ball.r);
        container.appendChild(div);
        launchBall();
    }

    function launchBall() {
        const p0 = new Vector2(ball.r, ysize - ball.r);
        const p1 = new Vector2(ball.r, ball.r);
        const p2 = new Vector2(xsize - ball.r, ball.r);
        const p3 = new Vector2(xsize - ball.r, ysize - ball.r);

        let d = Infinity;
        let bestObstacle;
        let bestReaction;

        function bounce(normal) {
            ball.v = ball.v.add(normal.mul(-2 * ball.v.dot(normal)));
            launchBall();
        }

        function test(obstacle, reaction) {
            const t = obstacle.intersection(ball.p, ball.v);
            if (t > 0 && t < d) {
                d = t;
                bestObstacle = obstacle;
                bestReaction = reaction;
            }
        }

        test(new Line(p0, p1), bounce);
        test(new Line(p1, p2), bounce);
        test(new Line(p2, p3), bounce);
        test(new Line(p3, p0), bounce); // TODO: Die here
        test(new Line(p2, p3), bounce); // TODO: Bat here
        test(new Circle(new Vector2(20, 20), 5), bounce);

        // Bounce this far short of the wall to prevent rounding errors putting us on the wrong side
        const fudge = 0.01;
        const speed = ball.v.magnitude();
        const target = ball.p.add(ball.v.mul(d - fudge / speed));
        const normal = bestObstacle.unitNormal(target);
        ball.animation = ball.div.animate(
            [
                { transform: makeBallTranslate(ball.p, ball.r) }, // 0%
                { transform: makeBallTranslate(target, ball.r) } // 100%
            ],
            1000 * d / speed
        );
        ball.p = target;
        ball.div.style.transform = makeBallTranslate(ball.p, ball.r);
        ball.animation.addEventListener("finish", function () {
            ball.animation = undefined;
            bestReaction(normal);
        });
    }

    function manageBat() {
        let d = 0;
        if (rightPressed) {
            d = 1;
        } else if (leftPressed) {
            d = -1;
        }
        if (d === bat.direction) {
            // Bat is already doing what we want
            return;
        }

        if (bat.animation) {
            // bat is moving so figure out where it is
            let currentTransform = new DOMMatrixReadOnly(getComputedStyle(bat.div).transform);
            bat.p.x = currentTransform.e / scale;
            bat.div.style.transform = makeTranslate(bat.p);
            // and cancel the animation
            bat.animation.cancel();
            bat.animation = undefined;
            bat.direction = 0;
        }

        if (d !== 0) {
            let speed = 50;
            let limit = d < 0 ? 0 : xsize - bat.w;
            const target = new Vector2(limit, bat.p.y);
            bat.animation = bat.div.animate(
                [
                    { transform: makeTranslate(bat.p) }, // 0%
                    { transform: makeTranslate(target) } // 100%
                ],
                1000 * Math.abs(bat.p.x - limit) / speed
            );
            bat.direction = d;
            bat.div.style.transform = makeTranslate(target);
            bat.p = target;
            bat.animation.addEventListener("finish", function () {
                bat.animation = undefined;
                bat.direction = 0;
            });
        }
    }
})();
