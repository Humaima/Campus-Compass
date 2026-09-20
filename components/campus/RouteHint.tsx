type Props = {
  buildingName: string;
};

export default function RouteHint({ buildingName }: Props) {
  return (
    <div className="
      absolute
      left-1/2
      top-16
      -translate-x-1/2
      z-30
      pixel-panel-sm
      text-ink
      px-4
      py-2
      text-sm
      font-bold
      text-center
    ">
      🧭 NEXT: {buildingName}
      <div className="text-xs font-normal mt-1">
        Keep following the route!
      </div>
    </div>
  );
}
