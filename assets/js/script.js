
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
         * @param {unit direction} v
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

    function makeTranslate(x, y) {
        return `translate(${x * scale}px,${y * scale}px)`;
    }

    function makeBallTranslate(x, y, r) {
        return `translate(${(x - r) * scale}px,${(y - r) * scale}px)`;
    }

    function initialiseBat() {
        const div = document.createElement("div");
        bat = { x: 10, y: ysize - 3, w: 8, h: 1, div: div };
        div.classList.add("bat");
        div.style.width = (bat.w * scale) + "px";
        div.style.height = (bat.h * scale) + "px";
        div.style.transform = makeTranslate(bat.x, bat.y);
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

    function initialiseBall() {
        const radius = 0.5;
        const div = document.createElement("div");
        ball = { p: new Vector2(xsize - 10, ysize - 3), w: 2 * radius, h: 2 * radius, r: radius, v: new Vector2(-4, -4), div: div };
        div.classList.add("ball");
        div.style.width = (ball.w * scale) + "px";
        div.style.height = (ball.h * scale) + "px";
        div.style.transform = makeBallTranslate(ball.p.x, ball.p.y, ball.r);
        container.appendChild(div);
        launchBall();
    }

    function launchBall() {
        const p0 = new Vector2(ball.r, ysize - ball.r);
        const p1 = new Vector2(ball.r, ball.r);
        const p2 = new Vector2(xsize - ball.r, ball.r);
        const p3 = new Vector2(xsize - ball.r, ysize - ball.r);

        const lines = [
            new Line(p0, p1),
            new Line(p1, p2),
            new Line(p2, p3),
            new Line(p3, p0)
        ]

        let d = Infinity;
        let best;
        let speed = ball.v.magnitude();
        let v = ball.v;
        for (const line of lines) {
            const t = line.intersection(ball.p, v);
            if (t > 0 && t < d) {
                d = t;
                best = line;
            }
        }
        // Bounce this far short of the wall to prevent rounding errors putting us on the wrong side
        const fudge = 0.01;
        let normal = best.p1.sub(best.p2).unit().normal();
        let target = ball.p.add(ball.v.mul(d - fudge / speed));
        ball.animation = ball.div.animate(
            [
                { transform: makeBallTranslate(ball.p.x, ball.p.y, ball.r) }, // 0%
                { transform: makeBallTranslate(target.x, target.y, ball.r) } // 100%
            ],
            1000 * d / speed
        );
        ball.p = target;
        ball.div.style.transform = makeBallTranslate(ball.p.x, ball.p.y, ball.r);
        ball.animation.addEventListener("finish", function () {
            ball.animation = undefined;
            ball.v = ball.v.add(normal.mul(-2 * ball.v.dot(normal)));
            launchBall();
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
            bat.x = currentTransform.e / scale;
            bat.div.style.transform = makeTranslate(bat.x, bat.y);
            // and cancel the animation
            bat.animation.cancel();
            bat.animation = undefined;
            bat.direction = 0;
        }

        if (d !== 0) {
            let speed = 50;
            let limit = d < 0 ? 0 : xsize - bat.w;
            bat.animation = bat.div.animate(
                [
                    { transform: makeTranslate(bat.x, bat.y) }, // 0%
                    { transform: makeTranslate(limit, bat.y) } // 100%
                ],
                1000 * Math.abs(bat.x - limit) / speed
            );
            bat.direction = d;
            bat.div.style.transform = makeTranslate(limit, bat.y);
            bat.x = limit;
            bat.animation.addEventListener("finish", function () {
                bat.animation = undefined;
                bat.direction = 0;
            });
        }
    }
})();
