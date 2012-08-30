Game_Meta = {
    Title: "tCell",
}

var WIDTH = 800;
var HEIGHT = 600;
var CELLSIZE = 64;
var LEVEL = 3;

// Keyboard input event handler
window.keydown = {};
function keyName(event) {
    return $.hotkeys.specialKeys[event.which] ||
        String.fromCharCode(event.which).toLowerCase();
}

$(document).bind("keydown", function(event) {
    keydown[keyName(event)] = true;
});

$(document).bind("keyup", function(event) {
    keydown[keyName(event)] = false;
});

$(document).bind("mousedown", function(event) {
    console.log(event);
});

// Basic object class for construction and inheritence
var Class = function(args) {
    var me = function() {
        this.init.apply(this, arguments);
    };

    for (var property in args) {
        me.prototype[property] = args[property];
    }

    if (!me.prototype.init) me.prototype.init = function(){};

    return me;
};

var Blood = Class({
    init: function(args) {
        this.x = args.x;
        this.y = args.y;
        this.maxSpeed = 64;
        this.deg = Math.floor((Math.random()*360)+1);
        this.mag = Math.floor((Math.random()*this.maxSpeed)+1);
        this.spritesheet = args.spritesheet;
        this.animationDelay = 0;
        this.cellNum = Math.floor((Math.random()*2)+1);
        this.cellSize = 64;
        this.width = this.cellSize;
        this.height = this.cellSize;
        this.infected = false;
        this.dieing = false;
        this.dead = false;
        this.animationSpeed = 1/2;
        this.condition = {
            healthy: 9*this.cellSize,
            infected: 10*this.cellSize,
            dieing: 11*this.cellSize,
            dead: 12*this.cellSize,
        }
        this.currentRow = this.condition.healthy;
    },
    next: function() {
        if (!this.dead) {
            if (this.cellNum == 2) {
                this.cellNum = 0;
            } else {
                this.cellNum += 1;
            }
        }
        if (this.dead) {
            if (this.cellNum == 7) {
                this.cellNum = 0;
            } else {
                this.cellNum += 1;
            }
        }
    },
    collide: function(thatX, thatY) {
        var theta;
        var relX = thatX - this.x;
        var relY = thatY - this.y;
        if (relX < 0) {
            theta = 180+Math.atan(relY/relX)/(Math.PI/180);
        } else if (relX > 0 && relY >= 0) {
            theta = Math.atan(relY/relX)/(Math.PI/180);
        } else if (relX > 0 && relY < 0) {
            theta = 360+Math.atan(relY/relX)/(Math.PI/180);
        } else if (relX == 0 && relY == 0) {
            theta = 0;
        } else if (relX == 0 && relY >= 0) {
            theta = 90;
        } else {
            theta = 270;
        }
        this.currentRow = this.condition.infected;
        console.log(theta);
    },
    update: function(tick) {
        if (this.dead) {
            this.animationSpeed = 1/7;
        }

        this.currentRow = this.condition.healthy;
        if (this.x+this.cellSize/2+this.cellSize/2 >= WIDTH) {
            this.collide(this.x+this.cellSize/2, this.y);
        } else if (this.x+this.cellSize/2-this.cellSize/2 <= 0) {
            this.collide(this.x-this.cellSize/2, this.y);
        }
        if (this.y+this.cellSize/2+this.cellSize/2 >= HEIGHT) {
            this.collide(this.x, this.y+this.cellSize/2);
        } else if (this.y+this.cellSize/2-this.cellSize/2 <= 0) {
            this.collide(this.x, this.y-this.cellSize/2);
        }

        this.x += (this.mag*tick)*Math.cos((this.deg*Math.PI)/180);
        this.y += (this.mag*tick)*Math.sin((this.deg*Math.PI)/180);

        this.animationDelay += tick;
        if (this.animationDelay >= this.animationSpeed) {
            this.next();
            this.animationDelay = 0;
        }
    },
    draw: function(context) {
        context.drawImage(
                this.spritesheet,
                this.cellNum*this.cellSize,
                this.currentRow,
                this.cellSize,
                this.cellSize,
                this.x,
                this.y,
                this.cellSize,
                this.cellSize
                );
    },
});

var Virus = Class({
    init: function(args) {
        this.x = args.x;
        this.y = args.y;
        this.color = args.color;
        this.spritesheet = args.spritesheet;
        this.animationDelay = 0;
        if (Math.random() >= 0.5) {
            this.cellNum = 0;
        } else {
            this.cellNum = 1;
        }
        this.velocity = args.velocity;
        this.cellSize = 64;
        this.width = this.cellSize;
        this.height = this.cellSize;
        this.colors = {
            red: 1,
            orange: 2,
            yellow: 3,
            blue: 4,
        }
    },
    next: function() {
        if (this.cellNum == 0) {
            this.cellNum = 1;
        } else {
            this.cellNum = 0;
        }
    },
    update: function(tick) {
        this.animationDelay += tick;
        if (this.animationDelay >= 1/3) {
            this.next();
            this.animationDelay = 0;
        }
    },
    draw: function(context) {
        context.drawImage(
                this.spritesheet,
                this.cellNum*this.cellSize,
                this.color*this.cellSize,
                this.cellSize,
                this.cellSize,
                this.x,
                this.y,
                this.cellSize,
                this.cellSize
                );
    },
});

var Player = Class({
    init: function(args) {
        this.x = args.x;
        this.y = args.y
        this.spritesheet = args.spritesheet;
        this.animationDelay = 0;
        this.cellNum = 0;
        this.velocity = 128;
        this.cellSize = 64;
        this.width = this.cellSize;
        this.height = this.cellSize;
    },
    next: function() {
        if (this.cellNum == 2) {
            this.cellNum = 0;
        } else {
            this.cellNum += 1;
        }
    },
    update: function(tick) {
        if (keydown.a) {
            this.x -= this.velocity*tick;
        }
        if (keydown.d) {
            this.x += this.velocity*tick;
        }
        if (keydown.w) {
            this.y -= this.velocity*tick;
        }
        if (keydown.s) {
            this.y += this.velocity*tick;
        }
        this.animationDelay += tick;
        if (this.animationDelay >= 1/5) {
            this.next();
            this.animationDelay = 0;
        }
    },
    draw: function(context) {
        context.drawImage(
                this.spritesheet,
                this.cellNum*this.cellSize,
                0,
                this.cellSize,
                this.cellSize,
                this.x,
                this.y,
                this.cellSize,
                this.cellSize
                );
    },
});

var Timer = Class({
    init: function() {
        this.start = $.now();
    },
    tick: function() {
        if (!this.lastTick) this.lastTick = $.now();
        this.delta = $.now() - this.lastTick;
        this.lastTick = $.now();
        return this.delta/1000; // Time elapsed in ms
    },
});

var Game = Class({
    init: function(args) {
        this.timer = new Timer();
        this.canvas = $(args.el)[0];
        this.level = args.level;
        this.context = this.canvas.getContext("2d");
        var bounds = {
            x: 0,
            y: 0,
            width: WIDTH,
            height: HEIGHT,
        }
        this.tree = new QuadTree(bounds, false);
        this.player = new Player({
            spritesheet: args.spritesheet,
            y: 0,
            x: 0,
        });
        this.viruses = [];
        this.bloods = [];
        for (var x = 0; x <= this.level; x++) {
            b_randX = Math.floor((Math.random()*800-64)+1);
            if (b_randX < 0) b_randX = 0;
            b_randY = Math.floor((Math.random()*600-64)+1);
            if (b_randY < 0) b_randY = 0;
            v_randX = Math.floor((Math.random()*800-64)+1);
            if (v_randX < 0) v_randX = 0;
            v_randY = Math.floor((Math.random()*600-64)+1);
            if (v_randY < 0) v_randY = 0;
            v_color = Math.floor((Math.random()*4)+1);
            this.viruses.push(new Virus({
                spritesheet: args.spritesheet,
                x: v_randX,
                y: v_randY,
                velocity: 64,
                color: v_color,
            }));
            this.bloods.push(new Blood({
                spritesheet: args.spritesheet,
                x: b_randX,
                y: b_randY,
            }));
            this.tree.insert(this.bloods[x]);
        }
    },
    updateTree: function() {
        this.tree.clear();
        this.tree.insert(this.bloods);
    },
    update: function() {
        var thisTick = this.timer.tick();
        this.player.update(thisTick);
        for (var i = 0; i <= this.level; i++) {
            this.bloods[i].update(thisTick);
            this.viruses[i].update(thisTick);
        }
        this.updateTree();
        var b;
        var len;
        var item;
        var items;
        var dx, dy, radii;
        var colliding = false;
        for (var i = 0; i < this.level; i++) {
            b = this.bloods[i];
            items = this.tree.retrieve(b);
            len = items.length;
            for (var j = 0; j < len; j++) {
                item = items[j];
                if (b == item) {
                    continue;
                }

                dx = b.x - item.x;
                dy = b.y - item.y;
                radii = CELLSIZE/2;

                colliding = ((dx*dx)+(dy*dy)) < (radii*radii);
                if (colliding) {
                    b.collide(item.x, item.y);
                    item.collide(b.x, b.y);
                }
            }
        }
    },
    render: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i <= this.level; i++) {
            this.bloods[i].draw(this.context);
            this.viruses[i].draw(this.context);
        }
        this.player.draw(this.context);
    },
});
