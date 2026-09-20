// The app's mark: a pixel-art graduation cap. Built as inline SVG rects on
// a fixed grid rather than an image file, so it stays crisp at any size and
// needs no asset request. The board + dome silhouette is drawn twice —
// once in ink offset by (1,1), once in gold on top — matching the same
// hard offset-shadow language as .pixel-panel/.pixel-button elsewhere in
// the app. Gold (not the plum "navy" token) is the fill so the mark still
// reads against the plum header, not just against light panels. The
// tassel is bold and sits outside that silhouette (not centered on top of
// it) so it doesn't get lost in the shadow at small sizes.
type Props = { size?: "sm" | "md" | "lg"; className?: string };

const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  sm: 30,
  md: 46,
  lg: 84,
};

// [x, y, width] rows, 1 unit tall each — a flat, wide board (not a tall
// diamond, which reads as an arrow at small sizes) sitting directly on a
// short rectangular dome.
const CAP_ROWS: Array<[number, number, number]> = [
  [7, 0, 2],
  [5, 1, 6],
  [3, 2, 10],
  [1, 3, 14],
  [3, 4, 10],
  [5, 5, 6],
  [5, 6, 6],
  [5, 7, 6],
];

// A solid rim line under the dome — drawn without the shadow pass, plain
// ink, so the cap has a defined base edge.
const TRIM: [number, number, number] = [5, 8, 6];

// Bold and outside the board's silhouette (hangs off the right point),
// so it reads as its own shape instead of merging into the shadow.
const TASSEL: Array<[number, number, number, number]> = [
  [14, 3, 1, 1],
  [14, 4, 1, 1],
  [14, 5, 1, 1],
  [13, 6, 1, 1],
  [13, 7, 1, 1],
  [12, 8, 2, 2],
];

export default function Crest({ size = "md", className = "" }: Props) {
  const width = SIZE_PX[size];
  const height = Math.round((width * 11) / 17);

  return (
    <svg
      viewBox="0 0 17 11"
      width={width}
      height={height}
      aria-hidden="true"
      className={`block ${className}`}
      style={{ shapeRendering: "crispEdges" }}
    >
      <g transform="translate(1,1)" fill="var(--color-ink)">
        {CAP_ROWS.map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={1} />
        ))}
      </g>
      <g fill="var(--color-gold)">
        {CAP_ROWS.map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={1} />
        ))}
      </g>
      <rect x={TRIM[0]} y={TRIM[1]} width={TRIM[2]} height={1} fill="var(--color-ink)" />
      <g fill="var(--color-ink)">
        {TASSEL.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} />
        ))}
      </g>
    </svg>
  );
}
