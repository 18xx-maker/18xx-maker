import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";

import { cn } from "@/util/cn";

const matches = (option, text) => {
  const needle = text.trim().toLowerCase();
  return (
    needle === "" ||
    option.value.toLowerCase().includes(needle) ||
    (option.label ?? "").toLowerCase().includes(needle)
  );
};

// An input with a list of suggestions that stays free text: the text is the
// value (the owner keeps it), picking a suggestion calls onSelect(option).
// The list is in a popover, so the scrolling container of the input does not
// clip it, and focus never leaves the input (aria-activedescendant).
// Arrow keys move through the list, Home and End once an entry is active,
// Enter picks the active entry (without one the owner gets onEnter, the typed
// text), and Escape closes the list before anything around it.
const Combobox = React.forwardRef(
  (
    {
      options = [],
      value,
      onValueChange,
      onSelect,
      onEnter,
      emptyText,
      className,
      onBlur,
      onKeyDown,
      id,
      ...props
    },
    ref,
  ) => {
    const listId = React.useId();
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    // The list shows every option until something is typed
    const [typed, setTyped] = React.useState(false);

    const shown = typed ? options.filter((o) => matches(o, value)) : options;
    const visible =
      open && (shown.length > 0 || (typed && value.trim() !== ""));
    const optionId = (index) => `${listId}-${index}`;

    React.useEffect(() => {
      if (visible && active >= 0) {
        document
          .getElementById(optionId(active))
          ?.scrollIntoView?.({ block: "nearest" });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, visible]);

    const close = () => {
      setOpen(false);
      setActive(-1);
      setTyped(false);
    };

    const pick = (option) => {
      onSelect?.(option);
      close();
    };

    const handleKeyDown = (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const last = shown.length - 1;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (!visible) {
            setOpen(true);
            setActive(shown.length > 0 ? 0 : -1);
          } else setActive(Math.min(last, active + 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          if (visible) setActive(Math.max(0, active - 1));
          break;
        case "Home":
        case "End":
          if (visible && active >= 0) {
            event.preventDefault();
            setActive(event.key === "Home" ? 0 : last);
          }
          break;
        case "Enter":
          if (visible && active >= 0 && shown[active]) {
            event.preventDefault();
            pick(shown[active]);
          } else {
            onEnter?.();
            close();
          }
          break;
        case "Tab":
          close();
          break;
      }
    };

    return (
      <PopoverPrimitive.Root
        open={visible}
        onOpenChange={(next) => !next && close()}
      >
        <PopoverPrimitive.Anchor asChild>
          <div className="relative">
            <Input
              ref={ref}
              id={id}
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={visible}
              aria-controls={visible ? listId : undefined}
              aria-activedescendant={
                visible && active >= 0 ? optionId(active) : undefined
              }
              className={cn("pr-8", className)}
              value={value}
              onChange={(event) => {
                onValueChange(event.target.value);
                setTyped(true);
                setActive(-1);
                setOpen(true);
              }}
              onClick={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              onBlur={(event) => {
                close();
                onBlur?.(event);
              }}
              {...props}
            />
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 opacity-50"
              aria-hidden="true"
            />
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            role="presentation"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            className="z-50 max-h-60 w-(--radix-popover-trigger-width) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            // Focus stays in the input; a press on the list does not blur it
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onMouseDown={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (event.target?.id === id) event.preventDefault();
            }}
          >
            {shown.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              <ul id={listId} role="listbox">
                {shown.map((option, index) => (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    className="flex cursor-default flex-row items-baseline justify-between gap-2 rounded-sm px-2 py-1.5 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                    onMouseMove={() => active !== index && setActive(index)}
                    onClick={() => pick(option)}
                  >
                    <span className="truncate font-medium">{option.value}</span>
                    {option.label && (
                      <span className="truncate text-xs text-muted-foreground">
                        {option.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
