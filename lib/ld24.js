$(function () {
    var canvas, context, image, width, height, xpos = 0, ypos = 0, index = 0, numFrames = 60, frameSize = 60;
    var rectX = 0, rectY = 0;
    var right = true, down = true;

    var player = {
        onload: function() {
        },
        draw: function () {
        },
        update: function() {
        },
    };

    var virus = {
        onload: function() {
        },
        draw: function() {
        },
        update: function() {
        },
    };

    var bloodCell = {
        onload: function() {
        },
        draw: function() {
        },
        update: function() {
        },
    };

    var tCell = {
        onload: function() {
        },
        draw: function() {
        },
        update: function() {
        },
    };

    var level = {
        onload: function() {
        },
        draw: function() {
        },
        update: function() {
        },
    };

    image = new Image();
    image.src = "spritesheet.png";
    image.onload = function() {
        width = image.width;
        height = image.height;
        canvas = $("#canvas")[0];
        context = canvas.getContext("2d");

        setInterval(function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, xpos, ypos, frameSize, frameSize, rectX, rectY, frameSize, frameSize);
            if (rectX + frameSize >= canvas.width) {
                right = false;
            } else if (rectX <= 0) {
                right = true;
            }
            if (rectY + frameSize >= canvas.height) {
                down = false;
            } else if (rectY <= 0) {
                down = true;
            }

            if (right) {
                rectX += 2;
            } else {
                rectX -= 2;
            }

            if (down) {
                rectY += 2;
            } else {
                rectY -= 2;
            }

            xpos += frameSize;
            index += 1;
            if(index >= numFrames) {
                xpos = 0;
                ypos = 0;
                index = 0;
            }
            else if(xpos + frameSize > width) {
                xpos = 0;
                ypos += frameSize;
            }
        }, 1000/60);
    };
});
