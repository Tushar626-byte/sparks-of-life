const { Anchor, Shape, RoundedRect, TAU, easeInOut } = Zdog;

const canvas = document.querySelector("canvas");

const context = canvas.getContext("2d");
const { width, height } = canvas;
const zoom = 4.5;

const colors = {
	backdrop: "hsl(240 23% 16%)",
	sparkles: ["hsl(240 25% 15%)", "hsl(264 88% 84%)", "hsl(180 98% 80%)"]
};

const [c0, c1, c2] = colors.sparkles;
const [s0, s1, s2] = [1, 2, 3];

const w = width / zoom - 1;
const h = height / zoom - 1;
const cornerRadius = Math.floor(Math.min(w, h) / 12);

const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute(
	"d",
	"M -27 -4 C -19 -4 -11 -8 -11 -14 -12 -19 -18 -19 -19 -14 -20 -6 -16 -1 -17 8 -18 16 -25 16 -25 10 -25 5 -18 5 -16 10 -12 15 -7 15 -6 11 -6 7 -10 7 -10 10 M -4 -3 C -1 -7 -8 -7 -4 -3 M -3.5 0 C -3.5 0 -1.5 5 -3 13 C -3 15 0 15 0 12 M 3 18 C 3 16 -1 15 -1 19 -1 23 8 23 7 15 7 12 2 3 3 -8 4 -12 10 -12 10 -6 10 -4 8 -3 6 -2 M 1 0 C -1 0 -2 3 0 4 C 2 5 6 3 8 4 M 12 5 C 15 6 19 6 19 3 18 0 13 2 12 5 12 10 16 12 19 10 M 24 6 29 1 28 9 25 2 31 5 24 6 Z"
);

const totalLength = path.getTotalLength();
const n = 301;
const g = totalLength / n;

const points = Array(n)
	.fill()
	.map((_, i) => {
		const { x, y } = path.getPointAtLength(g * i);
		return { x, y };
	});

const root = new Anchor();

new RoundedRect({
	addTo: root,
	color: colors.backdrop,
	fill: true,
	width: w,
	height: h,
	cornerRadius,
	translate: {
		z: -100
	}
});

const sparkles = new Anchor({
	addTo: root
});

const sparkle = new Shape({
	color: c0,
	stroke: s0
});

for (const { x, y } of points) {
	sparkle.copy({
		addTo: sparkles,
		translate: {
			x,
			y
		}
	});
}

context.lineJoin = "round";
context.lineCap = "round";

const render = () => {
	context.clearRect(0, 0, width, height);
	context.save();
	context.translate(width / 2, height / 2);
	context.scale(zoom, zoom);
	root.renderGraphCanvas(context);
	context.restore();
};

root.updateGraph();
render();

let frame = null;
let ticker = 0;
const cycle = 500;
const { length } = sparkles.children;
const y = -2;

const loop = () => {
	ticker = (ticker + 1) % cycle;
	const t = ticker / cycle;
	sparkles.rotate.y = easeInOut(t, 3) * TAU * -1;
	sparkles.translate.y = Math.sin(t * TAU) * y;

	root.updateGraph();
	render();

	frame = requestAnimationFrame(loop);
};

const animate = () => {
	ticker++;
	if (ticker >= cycle) {
		sparkles.children[length - 1].color = c1;
		sparkles.children[length - 1].stroke = s1;
		frame = requestAnimationFrame(loop);
	} else {
		frame = requestAnimationFrame(animate);

		const i = Math.floor((ticker / cycle) * length);
		const i1 = Math.max(0, i - 1);
		sparkles.children[i1].color = c1;
		sparkles.children[i1].stroke = s1;
		sparkles.children[i].color = c2;
		sparkles.children[i].stroke = s2;
	}

	root.updateGraph();
	render();
};

const handleClick = () => {
	frame = requestAnimationFrame(animate);
	button.setAttribute("disabled", "");
};

const button = document.querySelector("button");
button.removeAttribute("disabled");
button.addEventListener("click", handleClick, { once: true });
