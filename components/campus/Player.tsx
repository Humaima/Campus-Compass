type PlayerProps = {
  x: number;
  y: number;
};

// Sized as a percentage of the map, matching her original proportions in
// the artwork (89x127 out of the 1600x1000 source image) so she reads at
// the same scale now that she moves around instead of standing still.
const WIDTH_PCT = 5.56;
const HEIGHT_PCT = 12.7;

export default function Player({ x, y }: PlayerProps) {
  return (
    <img
      src="/assets/Player.png"
      alt="Player character"
      className="absolute z-20 pointer-events-none [image-rendering:pixelated] drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${WIDTH_PCT}%`,
        height: `${HEIGHT_PCT}%`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
