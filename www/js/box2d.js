var b2Vec2 = Box2D.Common.Math.b2Vec2
,   b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,   b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;


b2Vec2.prototype.add = function (b) {
	var a = this.Copy();
	a.Add(b);
	return a;
}
b2Vec2.prototype.subtract = function (b) {
	var a = this.Copy();
	a.Subtract(b);
	return a;
}
b2Vec2.prototype.multiply = function (b) {
	var a = this.Copy();
	if (b.x) {
		a.Set(a.x * b.x, a.y * b.y);
	} else {
		a.Multiply(b);
	}
	return a;	
}
b2Vec2.prototype.distance = function (b) {
	return Math.sqrt(Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2));
}
b2Vec2.prototype.unitTo = function (b) {
	var a = b.Copy();
	a.Subtract(this);
	a.Normalize();
	return a;	
}
b2Vec2.prototype.distance = function (b) {
	var a = b.Copy();
	a.Subtract(this);
	return a.Length();	
}
b2Vec2.prototype.randomize = function (s, u) {
	var a = this.Copy();
	a.Set(Math.random() - Math.random(), Math.random() - Math.random())
	a.Normalize();
	return a.multiply(s);
}



Math.easeInQuad = function (t, b, c, d) {
	t /= d;
	return c*t*t + b;
};
Math.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t*(t-2) + b;
};
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};