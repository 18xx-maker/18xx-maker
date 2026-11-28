import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HEX = /^#[0-9a-f]{6}$/i;

// Black or white text, whichever reads on the seat color
const inkOn = (color) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000" : "#fff";
};

// Who is at the board now: the initial of every online seat, its name as the
// label. Ids without a seat are ignored.
const Presence = ({ presence = [], seats = [] }) => {
  const here = [...new Set(presence)]
    .map((userId) => seats.find((s) => s.userId === userId))
    .filter(Boolean);
  if (!here.length) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <ul data-testid="play-presence" className="flex items-center -space-x-1">
        {here.map((seat) => {
          const name = seat.name || String(seat.userId);
          const color = HEX.test(seat.color || "") ? seat.color : null;
          return (
            <li key={seat.userId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    data-testid="play-avatar"
                    role="img"
                    aria-label={name}
                    tabIndex={0}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold uppercase"
                    style={
                      color
                        ? { backgroundColor: color, color: inkOn(color) }
                        : undefined
                    }
                  >
                    {Array.from(name)[0]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </TooltipProvider>
  );
};

export default Presence;
