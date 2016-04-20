/* global $ */
/* global THREE */

function Scene(options) {
	this.constructor(options);
}

var player = null;
var shadow = null;

Scene.prototype.constructor = function() {
	    	
    this.world = new b2World(new b2Vec2(0, 0), true); // km/h
    this.offset = new b2Vec2(0, -100);
	this.speed = new b2Vec2(0, -1.5);
    this.window = new b2Vec2($(window).width(), $(window).height());
    this.scale = 32.0;
    	
	// create a WebGL renderer, camera and a scene
	this.renderer = new THREE.WebGLRenderer();
	var width = this.window.x;
	var height = this.window.y;
    var near = -2;
    var far = 2;
	this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, near, far);
	this.scene = new THREE.Scene();

	// add the camera to the scene
	this.scene.add(this.camera);

	// the camera starts at 0,0,0
	// so pull it back
	this.camera.position.z = 300;

	// start the renderer
	this.renderer.setSize(width, height);

	// attach the render-supplied DOM element
	$('body').append(this.renderer.domElement);

	// create a new mesh with
	// sphere geometry - we will cover
	// the sphereMaterial next!
	var sphere = new THREE.Mesh(
		new THREE.PlaneGeometry(30, 30),
		new THREE.MeshLambertMaterial({
		  color: 0xFFFFFF
		})
	);

	// add the sphere to the scene
	this.scene.add(sphere);
	
    
	var sprite = null;
	var sprites = [];
	var count = 6;
	var size = 40;
	
	for (var x = 0; x < count; x++) {
		size = 30 + Math.random() * 60;
		sprite = new Sprite({
			y: 10000,
			width : size,
			height : size,
			density : 4,
			img : "img/rock.png",
			easing : "linear",
			scene : this,
			displaySize : 1.0
		});
		sprite.behaviors.push(new AsteroidBehavior());
		sprites.push(sprite);
	}
	
	sprites.push(new Stars({scene: this}));
	
	var cSize = 1.0;
	player = new Sprite({
		x: this.window.x / 2.0,
		y: this.window.y - 300,
		width: 60,
		height: 60,
		img: "img/Spaceship.png",
		easing: "linear",
		scene: this,
		shape: [new b2Vec2(0, -cSize), new b2Vec2(cSize, cSize), new b2Vec2(-cSize, cSize)]
	});

	sprites.push(player);

	player.time = new Date().getTime();

	shadow = new Sprite({
		y : this.window.y - 80,
		width : 60,
		height : 60,
		img : "img/Spaceship.png",
		scene : this
	});
	$(shadow.element).css("opacity", "0.5");
	shadow.left = this.window.x / 2.0;
	shadow.top = this.window.y - 300;
	shadow.element.style.webkitTransform = "translate3d(" + 
	    shadow.left + "px, " + shadow.top + "px, 0)";
	shadow.top -= 30;
	player.setGoal(new b2Vec2(shadow.left, shadow.top));

	var time = new Date().getTime();
	var frames = 0;

	this.sprites = sprites;
	
	this.render = function () {
		window.requestAnimationFrame(this.render.bind(this));
		
		frames += 1;
		//this.ctx.clearRect(0, 0, this.window.x, this.window.y);

		var now = new Date().getTime();
		var interval = now - time;
		if (interval >= 1000) {
			var fps = frames / (interval / 1000);
			$("#status").text("" + fps.toFixed(1) + " fps");
			time = now;
			frames = 0;
		}
		
		this.sprites.forEach(function (sprite, i) {
			sprite.update(now);
		});	
		
		this.renderer.render(this.scene, this.camera);
	}
	window.requestAnimationFrame(this.render.bind(this));
	
	setInterval(function () {
		this.world.Step(1/30, 1, 1);
		this.sprites.forEach(function (sprite, i) {
			sprite.updateFromPhysics();
			sprite.moveToGoal();
			sprite.execute();
		});
		this.offset.Add(this.speed);
	}.bind(this), 1000/30);

	
	var scene = this;

	$(document).on("mousemove touchstart touchmove", function(e) {
		var left = e.pageX;
		var top = e.pageY;
		try {
			left = e.originalEvent.touches[0].pageX;
			top = e.originalEvent.touches[0].pageY;
		} catch (e) {
		}
		
		top -= 90;

		if (shadow !== null && player !== null) {
			shadow.element.style.webkitTransform = "translate3d(" + left + "px, " + top + "px, 0)";
			shadow.left = left;
			shadow.top = top - 30;
			player.setGoal(new b2Vec2(left, shadow.top).add(scene.offset));				          
		}

		return false;
	});
};

var AsteroidBehavior = function (options) {
	this.constructor(options);
}
AsteroidBehavior.prototype.constructor = function () {
	
}
AsteroidBehavior.prototype.execute = function (sprite) {
	var pos = sprite.position(); 
	var margin = 25.0;
	
	if (
		pos.y > sprite.scene.offset.y + sprite.scene.window.y + margin ||
		pos.x < -margin || pos.x > sprite.scene.window.x + margin
	) {
		sprite.setPosition(
			new b2Vec2(
				sprite.scene.window.x * Math.random(), 
				sprite.scene.offset.y - 25 - 50 * Math.random()
			), 
			Math.random() * 7
		);
		
		sprite.body.SetLinearVelocity(new b2Vec2(0, 0));
		sprite.body.ApplyForce(new b2Vec2().randomize(new b2Vec2(2.0, 10.0)).add(new b2Vec2(0, 10)),
			sprite.body.GetWorldCenter());
	}
};
