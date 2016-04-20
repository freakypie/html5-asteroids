/** BaseObject */
function BaseObject(options) {
    this.constructor(options);
}
BaseObject.prototype.constructor = function () {};
BaseObject.extend = function (props, B, A) {
    if (! A) {
        A = function (options) {
            if (! options) {
                options = {};
            }
            this.constructor(options)           
        }
    }
    if (! B) {
        B = BaseObject;
    }
    A.prototype = Object.create(B.prototype);
    A.super = B.prototype;
    for (var prop in props) {
        A.prototype[prop] = props[prop];
    }
    A.extend = function(props) {
        return BaseObject.extend(props, A, null);
    }
    return A;
};

/** Element */
var Element = BaseObject.extend({
    constructor: function (options) {
        this.element = $("<div class='sprite'>").appendTo("body").get(0);       
    },
    _update3d: function (x, y, angle) {
        this.element.style[Element.prop3d] = "translate3d(" + 
            x + "px, " + y + "px, 0px) rotate(" + angle + "rad)";
    },
    _updateDom: function (x, y, angle) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }
});

function prop3d() {
    var el = document.createElement('p'),
    has3d, prop,
    transforms = {
        'transform':'transform',
        'webkitTransform':'-webkit-transform',
        'OTransform':'-o-transform',
        'msTransform':'-ms-transform',
        'MozTransform':'-moz-transform'
    };
    
    // Add it to the body to get the computed style
    document.body.insertBefore(el, null);
    for (var t in transforms){
        if (el.style[t] !== undefined) {
            el.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            if (has3d) {
                prop = transforms[t];
                break;
            }
        }
    }
    document.body.removeChild(el);
    return prop;
}

Element.prop3d = prop3d();
if (Element.prop3d) {
    Element.prototype.update = Element.prototype._update3d;
} else {
    Element.prototype.update = Element.prototype._updateDom;
}
   
/** BaseSprite */
var BaseSprite = BaseObject.extend({
    name: "BaseSprite",
    constructor: function (options) {
        BaseSprite.super.constructor.apply(this, [options]);
            
        this.scene = options.scene;
        this.behaviors = [];
    },
    update: function() {},
    updateFromPhysics: function() {},
    moveToGoal: function() {},
    execute: function() {}
});

/** Sprite */
var Sprite = BaseSprite.extend({
    constructor: function (options) {
        Sprite.super.constructor.apply(this, [options]);
        
        var time = new Date().getTime();        
    
        this.element = $("<div class='sprite'>").appendTo("body").get(0);
        
        var background = "red";
        if (options.img) {
            background = "url(" + options.img + ")";
            this.image = new Image();
            this.image.src = options.img;
        } else {
            background = options.color || "red";
        }
        
        $(this.element).css({
            background : background,
            position : "absolute",
            backgroundSize : "contain",
            top : 0,
            left : 0
        });
    
        this.displaySize = options.displaySize || 1.0;
        this.scene = options.scene;
        this.x = (options.x || 800);
        this.y = (options.y || 800);
        this.behaviors = [];
        this.updateTimer(0);
        this.updateSize(options.width || 30, options.height || 30);
        //this.updatePosition(options.x || 0, options.y || 0, options.angle || 0);
        this.setupPhysics(options);
    },
    
    setupPhysics: function  (options) {
        
        var type = (
            options.bodyType === undefined && 
            b2Body.b2_dynamicBody || options.bodyType
        );
        var width = (options.width || 30) / this.scene.scale;
        var height = (options.height || 30) / this.scene.scale;
        var fixDef = new b2FixtureDef();
        
        if (type == b2Body.b2_dynamicBody) {
            fixDef.density = options.density || 1.0;
        } else {
            fixDef.density = 0;
        }
        
        fixDef.friction = options.friction || 0.5;
        fixDef.restitution = options.restitution || 0.2;
        if (options.shape) {
            if (options.shape == "circle") {
                fixDef.shape = new b2CircleShape();
                fixDef.shape.SetRadius(width / 2);
            } else {
                fixDef.shape = new b2PolygonShape();
                var v = [];
                for (var x = 0; x < options.shape.length; x++) {
                    v.push(options.shape[x].Copy().multiply(
                        new b2Vec2(width / 2, height / 2)));
                }
                fixDef.shape.SetAsArray(v);
            }
        } else {
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(width / 2, height / 2);
        }
        
        var bodyDef = new b2BodyDef();      
        bodyDef.type = type;
        bodyDef.linearDamping = 1.0;
        bodyDef.position.x = this.x / this.scene.scale;
        bodyDef.position.y = this.y / this.scene.scale;
        
        this.body = options.scene.world.CreateBody(bodyDef);
        this.body.CreateFixture(fixDef);
    },
    
    setPosition: function  (a, angle) {
        this.body.SetPosition(a.multiply(1 / this.scene.scale));
        if (angle !== null && angle !== undefined) {
            this.body.SetAngle(angle);
        }
    },
    position: function  () {
        return this.body.GetPosition().Copy().multiply(this.scene.scale);
    },
    
    updateFromPhysics: function  () {
        var pos = this.position().subtract(this.scene.offset);
        var angle = this.body.GetAngle();
        var x = pos.x.toFixed(1);
        var y = pos.y.toFixed(1);
        angle = angle.toFixed(2); 
        
        if (x != this._x || y != this._y || angle != this._angle) {
            this._x = x;
            this._y = y;
            this._angle = angle;
            this.element.style.webkitTransform =  
                "translate3d(" + x + "px, " + y + "px, 0) rotate(" + 
                angle + "rad)";
                
            this.element.style.display = "block";
            this.element.style.zIndex = 100;
        }
    },
    
    updateTimer: function (dt, start, end) {
        clearTimeout(this.__end);
    
        if (dt <= 0) {
            // this.element.css("transition-duration", '0ms');//"all 0s");
        } else {
            // this.element.css("transition-duration", "" + dt + "ms");
        }
        //this.element.get(0).offsetHeight; // trigger css reflow
    
        this.dt = dt;
        
        if (start) {
            start();
            //this.element.get(0).offsetHeight; // trigger css reflow
        }
        if (end) {
            this.__end = setTimeout(end, dt);
        }
    },
    
    updateSize: function (width, height) {
        this.width = width;
        this.height = height;
        $(this.element).css({
            width : width * this.displaySize + "px",
            height : height * this.displaySize + "px",
            marginTop : "-" + (height * this.displaySize / 2) + "px",
            marginLeft : "-" + (width * this.displaySize / 2) + "px",
        })
    },
    
    setGoal: function  (goal) {
        this.goal = goal.multiply(1 / this.scene.scale);
    },
    
    moveToGoal: function  () {
        if (this.goal) {
            this.goal.Set(
                this.goal.x, 
                (this.scene.offset.y + shadow.top) / this.scene.scale);
            
            var d = this.body.GetPosition().unitTo(this.goal);
            
            var rotateRate = 0.2;
            var ta = Math.atan2(d.x, -d.y);
            var a = this.body.GetAngle();
            var na = (a - ta) % (Math.PI * 2);
            
            if (Math.abs(na)) {
                rotateRate *= 0.5;
            } else if (Math.abs(na) < Math.PI - 0.1) {
                rotateRate = 0.0;
            }
            a = ta;
            
            //a += this.body.GetAngularVelocity();
            
    
            var scale = 20.0;
            var dist = this.body.GetPosition().distance(this.goal);
            var limit = scale * 0.75;
            if (dist < limit) {     
                scale = Math.easeOutQuad(dist, 0, scale, limit);
            }       
            
            
            this.body.SetLinearVelocity(this.body.GetLinearVelocity().multiply(0.1));
            this.body.ApplyImpulse(
                new b2Vec2(
                    1 * Math.sin(a),
                    -1 * Math.cos(a)                
                ).multiply(scale), 
                this.body.GetWorldCenter());
            
            this.body.SetAngularVelocity(
                this.body.GetAngularVelocity()*.1
            );
            this.body.SetAngle(a); //ApplyTorque(rotateRate * 10);
        }   
    },
    
    updateTarget: function (x, y, angle) {
        this.angle = angle;
    
        if (!this.dt) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            $(this.element).css({
                webkitTransform : "translate3d(" + x + "px, " + y + "px, 0) rotate(" + angle + "rad)"
            });
        } else {
            this.target = {
                start: {
                    x: this.x,
                    y: this.y,
                    angle: this.angle
                },
                end: {
                    x: x,
                    y: y,
                    angle: angle
                },
                time: this.time
            };
        }
    },
    
    update: function  (t) {
        this.time = t;
        if (this.target) {
            var p = Math.min(1, (new Date().getTime() - this.target.time) / this.dt);
            var start = this.target.start;
            var end = this.target.end;
            
            this.x = start.x * (1 - p) + end.x * p;
            this.y = start.y * (1 - p) + end.y * p;
            this.angle = start.angle * (1 - p) + end.angle * p;
            
            //console.log(t, this.x, this.y);
            
            $(this.element).css({
                webkitTransform: "translate3d(" + this.x + "px, "
                    + this.y + "px, 0) rotate(" + this.angle + "rad)"
            });
            
            if (p >= 1) {
                this.target = null;
            }
        }
    },
    
    execute: function () {
        var sprite = this;
        this.behaviors.forEach(function(behavior, i) {
            behavior.execute(sprite);
        });
    }
});
