
// Use a function to avoid polluting the global namespace
(function () {
    "use strict";

    const xsize = 45;
    const ysize = 40;
    const scale = 15;

    let container,
        bat,
        bricks,
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
            }
        }
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
