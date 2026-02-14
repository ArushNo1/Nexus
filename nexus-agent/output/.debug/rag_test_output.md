# Query: how to add a sprite

[] (kaplay_docs/types.ts)
/**
 * A sprite in a sprite atlas.
 *
 * @group Assets
 * @subgroup Types
 */
export type SpriteAtlasEntry = LoadSpriteOpt & {
	/**
	 * X position of the top left corner.
	 */
	x: number;
	/**
	 * Y position of the top left corner.
	 */
	y: number;
	/**
	 * Sprite area width.
	 */
	width: number;
	/**
	 * Sprite area height.
	 */
	height: number;
};

---

[] (kaplay_docs/types.ts)
/**
 * Options for the {@link sprite `sprite()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SpriteCompOpt {
	/**
	 * If the sprite is loaded with multiple frames, or sliced, use the frame option to specify which frame to draw.
	 */
	frame?: number;
	/**
	 * If provided width and height, don't stretch but instead render tiled.
	 */
	tiled?: boolean;
	/**
	 * Stretch sprite to a certain width.
	 */
	width?: number;
	/**
	 * Stretch sprite to a certain height.
	 */
	height?: number;
	/**
	 * Play an animation on start.
	 */
	anim?: string;
	/**
	 * Speed multiplier for all animations (for the actual fps for an anim use .play("anim", { speed: 10 })).
	 */
	animSpeed?: number;
	/**
	 * Flip texture horizontally.
	 */
	flipX?: boolean;
	/**
	 * Flip texture vertically.
	 */
	flipY?: boolean;
	/**
	 * The rectangular sub-area of the texture to render, default to full texture `quad(0, 0, 1, 1)`.
	 */
	quad?: Quad;
	/**
	 * If fill the sprite (useful if you only want to render outline with outline() component).
	 */
	fill?: boolean;
}

---

[Game Objects] (kaplay_docs/en/getting_started/game_objects.mdx)
=> {
    debug.log(friend.sprite, "is here!");
});
`
}
    pgCode={
`
kaplay();

loadSprite("bean", "/crew/bean.png");
loadSprite("bag", "/crew/bag.png");

add([
    sprite("bean"),
    "friend",
]);

add([
    sprite("bag"),
    pos(80, 0),
    "friend",
]);

// Get a list with all game objects
const allObjs = get("*");
debug.log(allObjs.length);

// Get a list of friends tagged objects and iterate over them
get("friend").forEach((friend) => {
    debug.log(friend.sprite, "is here!");
});
`
    }
/>

### How to add a child

You can add children to a game object using `obj.add()`:

<Code
    loadCrew={["bag"]}
    addKAPLAYCall
    code={`
const bag = add([
    sprite("bag"),
]);

// It adds a mini-bag to bag
const miniBag = bag.add([
    sprite("bag"),
    scale(0.8),
    pos(40, 40),
]);

// Now our original Bag is a grandfather...
const superMiniBag = miniBag.add([
    sprite("bag"),
    scale(0.6),
    pos(40, 40),
    "favorite", // ...And the favorite
]);
    `}
/>

### How to remove a child

You can remove a child from a Game Object using `obj.remove()`;

<Code
    code={`
miniBag.remove(superMiniBag) // bye
bag.remove(miniBag); // bye
    `}
    pgCode={`
kaplay();

loadSprite("bag", "/crew/bag.png");

const bag = add([
    sprite("bag"),
]);

// It adds a mini-bag to bag
const miniBag = bag.add([
    sprite("bag"),
    scale(0.8),
    pos(40, 40),
]);

---

[Sprites] (kaplay_docs/en/getting_started/sprites.mdx)
ite()` component.

```js
kaplay();
loadSprite("bean", "sprites/bean.png");

const bean = k.add([sprite("bean"), pos(100, 100)]);
```

And your bean will be here!

You can also set different parameters

```js
const bean = k.add([
    sprite("bean", {
        frame: 1, // the frame of the sprite
        flipX: true, // flip the sprite in the X axis
        flipY: true, // flip the sprite in the Y axis
        anim: "crack", // the animation to play at the start
    }),
    pos(100, 100),
]);
```

## Playing animations

To play an animation, you can use the `SpriteComp.play()` method.

```js
const player = k.add([sprite("player"), pos(100, 100)]);

player.play("crack");
```

---

[Sprites] (kaplay_docs/en/getting_started/sprites.mdx)
# Rendering Sprites

The sprites are probably most of your visual aspects of your game.

## Loading Sprites

To load a sprite, you can use the `loadSprite()` function. This function mainly
takes two parameters: the sprite name and the sprite path.

```js
loadSprite(\"bean\", \"sprites/bean.png\")
```

This will load the sprite `bean` from the `sprites/bean.png` file.

### Spritesheets

When you have a spritesheet, you probably have animations. For these cases, the
best option for you is to use the `loadSprite()`'s third argument, where you can
set options related to animations.

![assets eggs](./assets/eggs.png)

```js
loadSprite("player", "sprites/player.png", {
    sliceX: 2, // how many sprites are in the X axis
    sliceY: 2, // how many sprites are in the Y axis
    anims: {
        crack: { from: 0, to: 3, loop: false },
        ghosty: { from: 4, to: 4 },
    },
});
```

This will load the spritesheet, and create two animations, `crack` and `ghosty`.

## Using sprites

To use a sprite in a Game Object, you must use the `sprite()` component.

```js
kaplay();
loadSprite("bean", "sprites/bean.png");

const bean = k.add([sprite("bean"), pos(100, 100)]);
```

And your bean will be here!

You can also set different parameters


# Query: tween animation

[Animation] (kaplay_docs/en/advanced/animation.mdx)
n ends, your application may crash. It
is advised to not use the global tween function for this reason, but use the
local one on the object, and only change properties of said object.

```js
kaplay();

loadSprite("bean", "sprites/bean.png");

const obj = add([pos(50, 50), sprite("bean"), timer()]);

obj.tween(vec2(50, 50), vec2(100, 50), 5, (value) => (obj.pos = value));
```

# Animate

Animate is the newer animation function. It has more functionality, yet is more
lightweight since you can animate more than one property, and you don't need to
chain if you need more than two interpolation values. Animate works with
keyframes. A simple animation of one property similar to the tween above would
be

```js
kaplay();

loadSprite("bean", "sprites/bean.png");

const obj = add([pos(50, 50), sprite("bean"), animate()]);

obj.animate("pos", [vec2(50, 50), vec2(100, 50)], { duration: 2 });
```

This animates the position from 50,50 to 150,100 during 2 seconds. As said
before, we can also use more than two points, for example

```js
obj.animate("pos", [vec2(50, 50), vec2(100, 50), vec2(100, 150)], {
    duration: 4,
});
```

---

[] (kaplay_docs/types.ts)
/**
 * Event controller for tween.
 *
 * @group Timer
 */
export interface TweenController extends TimerController {
	/**
	 * The current time in the duration of the tween
	 */
	currentTime: number;
	/**
	 * Finish the tween now and cancel.
	 */
	finish(): void;
}

---

[Animation] (kaplay_docs/en/advanced/animation.mdx)
# Basics

Every animation in KAPLAY is basically a handler attached to onUpdate, changing
values according to the elapsed time, dt(). So we could animate our position by
doing the following

```js
kaplay();

loadSprite("bean", "sprites/bean.png");

const obj = add([
    pos(50, 50),
    sprite("bean"),
    {
        time: 0,
    },
]);

obj.onUpdate(() => {
    obj.time += dt();
    const t = (obj.time % 5) / 5;
    obj.pos = lerp(vec2(50, 50), vec2(100, 50), t);
});
```

This will loop an animation with a duration of 5 seconds of the object moving
between two points. The lerp function linearly interpolates between two values.
This means that it follows the line between the two values at constant speed.
While everything can be animated using such an onUpdate handler, there are some
components which make this easier.

# Tween

Tweening is basically a linear interpolation happening during a specific time
interval. The tween function in the timer component is one of the earliest
general animation functions. It is limited to animating between two values, and
needs a function parameter which sets the value. This makes it a bit dangerous
since you can animate a value which is not on the object you call tween on. If
the object gets destroyed before the tween ends, your application may crash. It
is advised to not use the global tween function for this reason, but use the
local one on the object, and only change properties of said object.

```js
kaplay();

---

[] (kaplay_docs/types.ts)
/**
 * Frame-based animation configuration.
 *
 * @group Assets
 * @subgroup Types
 */
export type SpriteAnim = number | {
	/**
	 * The starting frame.
	 */
	from?: number;
	/**
	 * The end frame.
	 */
	to?: number;
	/**
	 * If this anim should be played in loop.
	 */
	loop?: boolean;
	/**
	 * When looping should it move back instead of go to start frame again.
	 */
	pingpong?: boolean;
	/**
	 * This anim's speed in frames per second.
	 */
	speed?: number;
	/**
	 * List of frames for the animation.
	 *
	 * If this property exists, **from, to, and pingpong will be ignored**.
	 */
	frames?: number[];
};

---

[] (kaplay_docs/types.ts)
/**
 * Sprite animation configuration when playing.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SpriteAnimPlayOpt {
	/**
	 * If this anim should be played in loop.
	 */
	loop?: boolean;
	/**
	 * When looping should it move back instead of go to start frame again.
	 */
	pingpong?: boolean;
	/**
	 * This anim's speed in frames per second.
	 */
	speed?: number;
	/**
	 * If the animation should not restart from frame 1 and t=0 if it is already playing.
	 *
	 * @default false
	 */
	preventRestart?: boolean;
	/**
	 * Runs when this animation ends.
	 */
	onEnd?: () => void;
}


# Query: area component collision

[] (kaplay_docs/types.ts)
/**
 * The {@link area `area()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaComp extends Comp {
	/**
	 * Collider area info.
	 */
	area: {
		/**
		 * If we use a custom shape over render shape.
		 */
		shape: Shape | null;
		/**
		 * Area scale.
		 */
		scale: Vec2;
		/**
		 * Area offset.
		 */
		offset: Vec2;
		/**
		 * Cursor on hover.
		 */
		cursor: Cursor | null;
	};
	/**
	 * If this object should ignore collisions against certain other objects.
	 *
	 * @since v3000.0
	 */
	collisionIgnore: Tag[];
	/**
	 * Restitution ("bounciness") of the object.
	 */
	restitution?: number;
	/**
	 * Friction of the object.
	 */
	friction?: number;
	/**
	 * If was just clicked on last frame.
	 */
	isClicked(): boolean;
	/**
	 * If is being hovered on.
	 */
	isHovering(): boolean;
	/**
	 * Check collision with another game obj.
	 *
	 * @since v3000.0
	 */
	checkCollision(other: GameObj<AreaComp>): Collision | null;
	/**
	 * Get all collisions currently happening.
	 *
	 * @since v3000.0
	 */
	getCollisions(): Collision[];
	/**
	 * If is currently colliding with another game obj.
	 */
	isColliding(o: GameObj<AreaComp>): boolean;
	/**
	 * If is currently overlapping with another game obj (like isColliding, but will return false if the objects are just touching edges).
	 */
	isOverlapping(o: GameObj<AreaComp>): boolean;
	/**
	 * Register an event runs when clicked.
	 *
	 * @since v2000.1
	 */
	onClick(f: () => void, btn?: MouseButton): KEventController;
	/**
	 * Register an event runs once when hovered.
	 *
	 * @since v3000.0
	 */
	onHover(action: () => void): KEventController;
	/**
	 * Register an event runs every frame when hovered.
	 *
	 * @since v3000.0
	 */
	onHoverUpdate(action: () => void): KEventController;
	/**
	 * Register an event runs once when unhovered.
	 *
	 * @since v3000.0
	 */
	onHoverEnd(action: () => void): KEventController;
	/**
	 * Register an event runs once when collide with another game obj with certain tag.
	 *
	 * @since v2001.0
	 */
	onCollide(tag: Tag, f: (obj: GameObj, col?: Collision) => void): KEventController;
	/**
	 * Register an event runs once when collide with another game obj.
	 *
	 * @since v2000.1
	 */
	onCollide(f: (obj: GameObj, col?: Collision) => void): KEventController;
	/**
	 * Register an event runs every frame when collide with another game obj with certain tag.
	 *
	 * @since v3000.0
	 */
	onCollideUpdate(tag: Tag, f: (obj: GameObj, col?: Collision) => void): KEventController;
	/**
	 * Register an event runs every frame when collide with another game obj.
	 *
	 * @since v3000.0
	 */
	onCollideUpdate(f: (obj: GameObj, col?: Collision) => void): KEventController;
	/**
	 * Register an event runs once when stopped colliding with another game obj with certain tag.
	 *
	 * @since v3000.0
	 */
	onCollideEnd(tag: Tag, f: (obj: GameObj) => void): KEventController;
	/**
	 * Register an event runs once when stopped colliding with another game obj.
	 *
	 * @since v3000.0
	 */
	onCollideEnd(f: (obj: GameObj) => void): void;
	/**
	 * If has a certain point inside collider.
	 */
	hasPoint(p: Vec2): boolean;
	/**
	 * Push out from another solid game obj if currently overlapping.
	 */
	resolveCollision(obj: GameObj): void;
	/**
	 * Get the geometry data for the collider in local coordinate space.
	 *
	 * @since v3000.0
	 */
	localArea(): Shape;
	/**
	 * Get the geometry data for the collider in world coordinate space.
	 */
	worldArea(): Shape;
	/**
	 * Get the geometry data for the collider in screen coordinate space.
	 */
	screenArea(): Shape;
	serialize(): any;
}

---

[] (kaplay_docs/types.ts)
/**
 * Options for the {@link area `area()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaCompOpt {
	/**
	 * The shape of the area (currently only Rect and Polygon is supported).
	 *
	 * @example
	 * ```js
	 * add([
	 *     sprite("butterfly"),
	 *     pos(100, 200),
	 *     // a triangle shape!
	 *     area({ shape: new Polygon([vec2(0), vec2(100), vec2(-100, 100)]) }),
	 * ])
	 * ```
	 */
	shape?: Shape;
	/**
	 * Area scale.
	 */
	scale?: number | Vec2;
	/**
	 * Area offset.
	 */
	offset?: Vec2;
	/**
	 * Cursor on hover.
	 */
	cursor?: Cursor;
	/**
	 * If this object should ignore collisions against certain other objects.
	 *
	 * @since v3000.0
	 */
	collisionIgnore?: Tag[];
	/**
	 * Bounciness factor between 0 and 1.
	 *
	 * @since v4000.0
	 */
	restitution?: number;
	/**
	 * Friction factor between 0 and 1.
	 *
	 * @since v4000.0
	 */
	friction?: number;
}

---

[Physics] (kaplay_docs/en/advanced/physics.mdx)
# Physics

There are two main components which implement physics in KAPLAY. Area and Body.

## Area

Area is used to define the area of the object. This can be seen as the collision
shape, whether the object is actually solid or not. When using just area,
without body, the object is not solid, but still reports overlapping with other
areas as long as you set the isSensor flag. Area has three events for this:

- onCollide which is fired when the collision starts.
- onCollideUpdate which is fired during collision.
- onCollideEnd which is fired when the collision ends.

By default, an area component creates a shape similar to the shape which is
drawn. Thus a sprite receives an area which has the size and position of the
sprite. A custom shape can be passed if this is not what is needed.

## Body

Body makes an object with an area solid, as well as makes it being affected by
gravity if gravity is set.

```ts
setGravity(100);
// Inverse gravity
setGravityDirection(vec2(0, -1));
```

To make an object with a body not affected by gravity, like a platform, it can
be made static using `isStatic: true`.

```ts
add([pos(80, 400), rect(250, 20), area(), body({ isStatic: true })]);
```

A body has a velocity `obj.vel` (px/s). This velocity can changed by using
impulses and forces. An impulse (px/s) is a sudden change in velocity, its
effect does not depend on the mass (kg) of the object.

```ts
obj.applyImpulse(vec2(100, 0));
```

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
k.area({ collisionIgnore: ["boundary"] }),
                    k.body({ isStatic: true }),
                    "boundary",
                ]);
            });
        },
    },
];
```

Here we added invisible boundaries, that are outside of our screen, but bleed 5
pixels in. So if we enabled rectangles fill, we would see just 5px lines instead
of 500px. Also, with thickness like that, we ensure the puck won't break out
instead of bouncing away. It will be rejected back to the field as the distance
back would be shorter than past it, if it manages to get a few pixels in
(physics are updated at 50fps). I thought Mark was smart enough to say it
himself.

<Info crew="mark" title="I'm smart. *I'm am!*"></Info>

Also, we added them to `collisionIgnore` array as they would be touching
continuously forever and we don't need to waste our resources on it. We made
them static as well, as they should never move.

Let's continue with the field, right under the `this.boundaries` code. We will
center it as it will be easier to draw from the center as well:

```ts
const field = this.add([
    k.anchor("center"),
    k.pos(k.center()),
    k.rect(k.width() - 20, k.height() - 20, { radius: 100 }),
    k.outline(10, k.WHITE),
    k.opacity(0.4),
]);
```

I don't have anything smart to say about this either, so let's just add the nets
as well right after:

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
are going to draw it all in KAPLAY instead!
😮

```ts

export default () => [
    k.pos(),
    k.z(0),
    {
        add(this: GameObj) {
            const thickness = 500;
            const bleed = 5;

            this.boundaries = [
                {
                    x: -thickness,
                    y: -thickness,
                    w: k.width() + thickness * 2,
                    h: thickness + bleed,
                },
                {
                    x: -thickness,
                    y: k.height() - bleed,
                    w: k.width() + thickness * 2,
                    h: thickness + bleed,
                },
                {
                    x: -thickness,
                    y: -thickness,
                    w: thickness + bleed,
                    h: k.height() + thickness * 2,
                },
                {
                    x: k.width() - bleed,
                    y: -thickness,
                    w: thickness + bleed,
                    h: k.height() + thickness * 2,
                },
            ].map(({ x, y, w, h }) => {
                this.add([
                    k.pos(x, y),
                    k.rect(w, h, { fill: false }),
                    k.area({ collisionIgnore: ["boundary"] }),
                    k.body({ isStatic: true }),
                    "boundary",
                ]);
            });
        },
    },
];
```


# Query: camera position and zoom

[] (kaplay_docs/types.ts)
/**
 * @group Rendering
 * @subgroup Camera
 */
export type CamData = {
	pos: Vec2 | null;
	scale: Vec2;
	angle: number;
	shake: number;
	transform: Mat23;
};

---

[Video] (kaplay_docs/en/concepts/video.mdx)
# Videos

A video can be played using the video component. This can be used for intros, or cut-scenes for example.

## The video component

```ts
const intro = add([
    pos(200, 100), // Where to place the video
    video("intro.mp4"),
]);

intro.play();
```

## Play, pause, rewind

The video doesn't automatically start playing, for that `intro.start()` needs to be called. To pause the video there is `intro.pause()`. If you want stop functionality, you can call `intro.pause()` and set `intro.currentTime` to 0.

## Play position

The play position, aka `intro/currentTime`, can be get and set. The relative position can be computed by dividing by `intro.duration`.

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
data?.height ?? this.height),
            k.opacity(0.2),
        ]);

        const moveOffset = {
            x: this.width / 2,
            y: this.height / 2,
            overshoot: 10,
        };

        this.moveMinMax = {
            x: Object.values(player.team == "left" ? {
                min: moveOffset.x,
                max: k.width() / 2 - moveOffset.x + moveOffset.overshoot,
            } : {
                min: k.width() / 2 + moveOffset.x - moveOffset.overshoot,
                max: k.width() - moveOffset.x,
            }),
            y: Object.values({
                min: moveOffset.y,
                max: k.height() - moveOffset.y,
            })
        };

        if (player.sessionId == room.sessionId) onLocalPlayerCreated(room, this);
    },
  },
]);
```

<Info crew="mark" title="
    The most important thing here is we added raytracing for players by flipping the player sprite by Y axis and positioning it under the player. Reflections kinda work like that.
"></Info>

Well, the actual most important thing here is the `moveMinMax`, the minimum and
maximum position coordinates for the players. Player on the left side, can move
from 0 to half of the screen, where the middle line is. With player object size
taken into account, as well as the `overshoot`. We have that so you can go
slightly past the line, to not loose all the momentum right in front of it, like
when trying to hit the puck in the center, but barely reaching it.

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
f just a few
pixels when the hit happens for both players depending on their last updated
position. Thanks to the **authority switching**, you avoid that by having the
one source of truth at the time.

Let's create the puck object, at our usual objects location
`/client/src/objs/puck.ts`:

First, we import all things used, as always:

```ts

```

Next, we define a couple of constants we will use. The puck `size` and the
center `startPos`:

```ts
const size = 48;
const startPos = () => (k.center().sub(0, 6));
```

We made `startPos` a function to recalculate the center, just in case. Also, the
`sub` part is an offset to compensate the fake 3D perspective it has.

And now to the object itself:

```ts
export default (room: Room<MyRoomState>) => [
    k.pos(startPos()),
    k.anchor("center"),
    k.area({
        shape: new k.Circle(k.vec2(0), size / 2),
        restitution: 0.2, // bounciness
    }),
    k.body(),
    k.scale(0), // we will scale-in the puck on spawn
    k.z((k.height() - size) / 2), // starting Z is the center of Y
    "puck",
    {
        add(this: GameObj) {
            const $ = getStateCallbacks(room);
            const localPlayerId = room.sessionId;

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
ame time. So it makes sense that you would like
to try play-testing against yourself more interactively and use your phone as
the second player. Let's add support for it. It's going to be a quick one!

Open `/client/src/objs/player.ts` and look for the
`let mousePos = playerObj.startPos;` line. Add a new variable below it:

```ts
let mousePos = playerObj.startPos;
let touchPos = playerObj.startPos;
```

Now, look for the `k.onMouseMove(move);` line. Add this code below it:

```ts
k.onTouchStart(pos => touchPos = pos);
k.onTouchMove((pos) => {
    move(pos, pos.sub(touchPos).scale(window.devicePixelRatio), false);
    touchPos = pos;
});
```

First, we are saving the initial touch position on touch start. Then, we are
using the same `move` function that mouse uses and we simulate the needed
arguments for it. `pos` is a reported position by touch move, next argument is
simulating the `delta` - just the difference between the new and the last pos,
additionally scaled by the device pixel ratio (as the phone has different screen
size/resolution/density). Without it, it would move slightly slower than you
would expect. And the last one `false` is for the `isMouse` parameter.


# Query: playing sounds and music

[Sounds] (kaplay_docs/en/getting_started/sounds.mdx)
# Sounds

In KAPLAY, you can easily add sound effects and background music to your game.

## Loading sounds

For load audio files, you can use the `loadSound()` function. This function
takes two parameters, the sound name and the sound path.

```js
kaplay();

loadSound("soundName", "/path/to/sound.mp3");
```

## Playing sounds

Use `play(sound, opt?)` to play an audio. It takes the name
of the sound and, optionally, an `AudioPlayOpt` options object. It will return an `AudioPlay`.

```js
const burpSnd = play("burp", {
    volume: 0.5, // set the volume to 50%
    speed: 1.5, // speed up the sound
    loop: true, // loop the sound
});
```

## Controlling audio

To stop, seek or modify playing sounds you can use the `AudioPlay` object, returned
by `play()`.

```js
const sound = play("soundName");

// pause the song
sound.pause();
```

---

[] (kaplay_docs/types.ts)
/**
 * Audio play configurations.
 *
 * @group Audio
 */
export interface AudioPlayOpt {
	/**
	 * If audio should start out paused.
	 *
	 * @since v3000.0
	 */
	paused?: boolean;
	/**
	 * If audio should be played again from start when its ended.
	 */
	loop?: boolean;
	/**
	 * Volume of audio. 1.0 means full volume, 0.5 means half volume.
	 */
	volume?: number;
	/**
	 * Playback speed. 1.0 means normal playback speed, 2.0 means twice as fast.
	 */
	speed?: number;
	/**
	 * Detune the sound. Every 100 means a semitone.
	 *
	 * @example
	 * ```js
	 * // play a random note in the octave
	 * play("noteC", {
	 *     detune: randi(0, 12) * 100,
	 * })
	 * ```
	 */
	detune?: number;
	/**
	 * The start time, in seconds.
	 */
	seek?: number;
	/**
	 * The stereo pan of the sound.
	 * -1.0 means fully from the left channel, 0.0 means centered, 1.0 means fully right.
	 * Defaults to 0.0.
	 */
	pan?: number;
	/**
	 * If the audio node should start out connected to another audio node rather than
	 * KAPLAY's default volume node. Defaults to undefined, i.e. use KAPLAY's volume node.
	 */
	connectTo?: AudioNode;
}

---

[] (kaplay_docs/types.ts)
/**
 * @group Audio
 */
export interface AudioPlay {
	/**
	 * Start playing audio.
	 *
	 * @since v3000.0
	 */
	play(time?: number): void;
	/**
	 * Seek time.
	 *
	 * @since v3000.0
	 */
	seek(time: number): void;
	/**
	 * Stop the sound.
	 *
	 * @since v3001.0
	 */
	stop(): void;
	/**
	 * If the sound is paused.
	 *
	 * @since v2000.1
	 */
	paused: boolean;
	/**
	 * Playback speed of the sound. 1.0 means normal playback speed, 2.0 means twice as fast.
	 */
	speed: number;
	/**
	 * Detune the sound. Every 100 means a semitone.
	 *
	 * @example
	 * ```js
	 * // tune down a semitone
	 * music.detune = -100
	 *
	 * // tune up an octave
	 * music.detune = 1200
	 * ```
	 */
	detune: number;
	/**
	 * Volume of the sound. 1.0 means full volume, 0.5 means half volume.
	 */
	volume: number;
	/**
	 * The stereo pan of the sound.
	 * -1.0 means fully from the left channel, 0.0 means centered, 1.0 means fully right.
	 * Defaults to 0.0.
	 */
	pan?: number;
	/**
	 * If the audio should start again when it ends.
	 */
	loop: boolean;
	/**
	 * The current playing time (not accurate if speed is changed).
	 */
	time(): number;
	/**
	 * The total duration.
	 */
	duration(): number;
	/**
	 * Register an event that runs when audio ends.
	 *
	 * @since v3000.0
	 */
	onEnd(action: () => void): KEventController;
	then(action: () => void): KEventController;
	/**
	 * Disconnect the audio node from whatever it is currently connected to
	 * and connect it to the passed-in audio node, or to Kaplay's default volume node
	 * if no node is passed.
	 */
	connect(node?: AudioNode): void;
}

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
for that.
Quite the opposite. And you will learn one more important
thing.

Normally, we would do something for the puck object, like this:

```ts
this.onCollide("boundary", () => k.play("hit"));
```

But this will only play when the local player is the authority. It's due to the
puck's position either being lerped, or having a latency. So there is a very
high probability that when the other player hits the puck to the wall, it won't
sync position for you exactly when the puck hits the wall. We will have to split
it for the local player, and the other players as well, just like we were
doing with the puck position. And instead of limiting it only to the sound,
let's also make it more general to give you one more idea how to sync in-game
events and data.

### Events & data syncing

Let's implement it on the server side first. We will listen for `"event"`
message and broadcast another message to all clients, based on the received data.
Open `/server/src/rooms/MyRoom.ts` and add this below the
`this.onMessage("goal", ...);`:

```ts
this.onMessage(
    "event",
    (
        client,
        { name, exceptLocal, data }: {
            name?: string;
            exceptLocal?: boolean;
            data?: any;
        } = {},
    ) => {
        this.broadcast(
            name ? `event:${name}` : "event",
            data,
            exceptLocal && { except: client },
        );
    },
);
```

---

[Multiplayer with Colyseus] (kaplay_docs/en/integrations/0_multiplayer_with_colyseus.mdx)
you should wait for that instead when resetting or starting the round, if you are letting the first player to play on their own in the meantime, as we do.
"></Info>

## Where to go with the game next

We could improve it further (and forever). By adding some small features, like
doing countdown after each goal with proper round timing. Or some bigger ones,
like adding the goalkeepers! I think that could be your homework.

Although, we surely all agree it could use at least a one more sound, besides
the burp one on goal (this one will have to stay). And it's the sound of the
puck hitting the wall. And the player hitting the puck (although adding burp
here is tempting too).

Ok, right click
[this link](https://github.com/kaplayjs/kaplay/raw/refs/heads/master/examples/sounds/hit.mp3)
to download the sound and save it to the new folder at `/client/public/sounds`
as `hit.mp3`.

Load it in the `/client/src/App.ts` file, in the `main()` function below the
`k.loadFont(...);`:

```ts
k.loadSound("hit", "sounds/hit.mp3");
```

Now, you might think this is going to be an easy change and we chose it for that.
Quite the opposite. And you will learn one more important
thing.

Normally, we would do something for the puck object, like this:

```ts
this.onCollide("boundary", () => k.play("hit"));
```

