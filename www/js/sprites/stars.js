
var Stars = BaseSprite.extend({
	name: "Stars",
	constructor: function (options) {
		Stars.super.constructor.apply(this, [options]);

		this.loop = 0;
		this.count = options.count || 1;
		this.elements = {};
		
// 		var colors = ["star1.png", "star2.png", "star3.png", "star4.png"];
		var colors = ["white", "#AAA", "#CCC", "#AAF"];
		var element = null;
		
		for (var x = 0; x < this.count; x++) {
			element = {};
			element.x = Math.random() * this.scene.window.x;
			element.y = Math.random() * this.scene.window.y;
			element.angle = Math.random() * 6;
			element.size = 1 + Math.random();
			element.color = colors[parseInt(Math.random() * colors.length)];
			if (! this.elements[element.color]) {
				this.elements[element.color] = [];
			}
			this.elements[element.color].push(element);
		}
	},
	update: function() {
	}
});
