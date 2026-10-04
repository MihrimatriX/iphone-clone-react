import type { CanvasTexture } from "three";
import { paint } from "./textures";

const MONO = "'Cascadia Code', Consolas, 'SF Mono', monospace";
const SANS = "'Segoe UI', Inter, system-ui, sans-serif";

/** What's open in the editor: this scene's own source, more or less. */
const CODE = [
  `import { Canvas } from "@react-three/fiber";`,
  `import { Desk, Mount, Stand } from "./Desk";`,
  `import { Phone } from "./Phone";`,
  ``,
  `// Everything fades to the room tone outside the lamp's reach.`,
  `export default function Scene() {`,
  `  const stage = useRef<HTMLDivElement>(null!);`,
  `  const [roomReady, setRoomReady] = useState(false);`,
  `  return (`,
  `    <div ref={stage} className={s.stage}>`,
  `      <Canvas dpr={[1, 2]} frameloop="demand" shadows>`,
  `        <fog attach="fog" args={["#0b0a0c", 70, 190]} />`,
  `        <Suspense fallback={<RevealFrame />}>`,
  `          <Desk />`,
  `          <Lamp />`,
  `        </Suspense>`,
  `        <Mount>`,
  `          <Phone screen={<Shell />} portal={stage} />`,
  `        </Mount>`,
  `      </Canvas>`,
  `    </div>`,
  `  );`,
  `}`,
];

/** Tiny tokenizer: first matching rule wins; an empty colour means "advance without drawing". */
const RULES: [RegExp, string][] = [
  [/^\/\/.*/, "#6b7489"],
  [/^"[^"]*"|^'[^']*'/, "#c3e88d"],
  [/^(import|from|export|default|function|const|return)\b/, "#c792ea"],
  [/^<\/?[A-Z]\w*|^<\/?[a-z]+|^\/?>/, "#82aaff"],
  [/^[A-Za-z_]\w*(?=\()/, "#ffcb6b"],
  [/^\d+(\.\d+)?/, "#f78c6c"],
  [/^[A-Za-z_]\w*/, "#d6deeb"],
  [/^\s+/, ""],
  [/^./, "#89ddff"],
];

function drawCode(ctx: CanvasRenderingContext2D, line: string, x: number, y: number) {
  let rest = line;
  while (rest) {
    const [re, color] = RULES.find(([r]) => r.test(rest)) ?? [/^./, ""];
    const token = re.exec(rest)?.[0] ?? rest[0] ?? "";
    if (color) {
      ctx.fillStyle = color;
      ctx.fillText(token, x, y);
    }
    x += ctx.measureText(token).width;
    rest = rest.slice(token.length);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

type Box = { x: number; y: number; w: number; h: number };

/** Wallpaper, menu bar and dock. */
function drawDesktop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#1a2147");
  bg.addColorStop(1, "#3a1d4f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, w, 30);
  ctx.font = `600 16px ${SANS}`;
  ctx.fillStyle = "#e8e8ee";
  ["Code", "File", "Edit", "Selection", "View", "Terminal"].forEach((m, i) => ctx.fillText(m, 40 + i * 92, 21));
  ctx.fillText("Paz 4 Eki  00:47", w - 160, 21);
  roundRect(ctx, w / 2 - 300, h - 84, 600, 70, 20, "rgba(255,255,255,0.14)");
  ["#2f7cf6", "#f2f2f2", "#34c759", "#ff9f0a", "#5e5ce6", "#ff375f", "#30b0c7", "#8e8e93"].forEach((c, i) => roundRect(ctx, w / 2 - 280 + i * 70, h - 74, 52, 52, 12, c));
}

const FILES = ["▾ src", "  ▸ apps", "  ▸ os", "  ▾ scene", "      Desk.tsx", "      Lamp.tsx", "      Phone.tsx", "      Scene.tsx", "      Steam.tsx", "  ▸ ui", "  main.tsx", "README.md"];
const TERMINAL = [["#7ee787", "$ bun dev"], ["#d6deeb", "iPhone clone: http://localhost:3000/"], ["#6b7489", "[0.21ms] bundle index.html 4.4 MB"]] as const;

/** Editor window frame: title bar with traffic lights and the file tree. Returns the code pane. */
function drawWindow(ctx: CanvasRenderingContext2D, win: Box): Box {
  roundRect(ctx, win.x, win.y, win.w, win.h, 14, "#1d1e25");
  roundRect(ctx, win.x, win.y, win.w, 40, 14, "#2a2b33");
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => roundRect(ctx, win.x + 20 + i * 24, win.y + 13, 14, 14, 7, c));
  ctx.font = `15px ${SANS}`;
  ctx.fillStyle = "#a9adb8";
  ctx.fillText("Scene.tsx — iphone-clone-react", win.x + win.w / 2 - 110, win.y + 26);
  const side = { x: win.x, y: win.y + 40, w: 270 };
  ctx.fillStyle = "#23242c";
  ctx.fillRect(side.x, side.y, side.w, win.h - 40);
  FILES.forEach((f, i) => {
    if (f.includes("Scene.tsx")) roundRect(ctx, side.x + 8, side.y + 14 + i * 28, side.w - 16, 26, 5, "#37394a");
    ctx.fillStyle = f.includes(".") ? "#c8ccd6" : "#8d93a1";
    ctx.fillText(f, side.x + 18, side.y + 32 + i * 28);
  });
  return { x: side.x + side.w, y: side.y, w: win.w - side.w, h: win.h - 40 };
}

/** Tabs, the highlighted source with line numbers, and the terminal panel at the bottom. */
function drawEditor(ctx: CanvasRenderingContext2D, pane: Box) {
  ctx.fillStyle = "#26272f";
  ctx.fillRect(pane.x, pane.y, pane.w, 36);
  roundRect(ctx, pane.x, pane.y, 150, 36, 0, "#1d1e25");
  ["Scene.tsx", "Desk.tsx", "Phone.tsx"].forEach((tab, i) => {
    ctx.fillStyle = i === 0 ? "#e6e6ea" : "#8d93a1";
    ctx.fillText(tab, pane.x + 36 + i * 150, pane.y + 24);
  });
  ctx.font = `17px ${MONO}`;
  CODE.forEach((line, i) => {
    const y = pane.y + 70 + i * 25;
    if (i === 13) roundRect(ctx, pane.x, y - 18, pane.w, 25, 0, "#2a2c38");
    ctx.fillStyle = "#4b5163";
    ctx.fillText(String(i + 1).padStart(2), pane.x + 16, y);
    drawCode(ctx, line, pane.x + 70, y);
  });
  const term = pane.y + pane.h - 136;
  ctx.fillStyle = "#18191f";
  ctx.fillRect(pane.x, term, pane.w, 122);
  ctx.fillStyle = "#8d93a1";
  ctx.fillText("TERMINAL", pane.x + 18, term + 26);
  TERMINAL.forEach(([color, text], i) => {
    ctx.fillStyle = color;
    ctx.fillText(text, pane.x + 18, term + 58 + i * 24);
  });
}

/** The laptop's display: wallpaper, menu bar, an editor window (files, tabs, code, terminal) and a dock. */
export function screenTexture(): CanvasTexture {
  const [w, h] = [1600, 1040];
  return paint(w, h, ctx => {
    drawDesktop(ctx, w, h);
    drawEditor(ctx, drawWindow(ctx, { x: 70, y: 62, w: w - 140, h: 860 }));
  });
}
