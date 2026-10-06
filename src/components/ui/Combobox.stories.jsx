import { useState } from "react";

import { Combobox } from "@/components/ui/combobox";

const trains = [
  { value: "2", label: "$80" },
  { value: "3", label: "$180" },
  { value: "4", label: "$300" },
  { value: "5", label: "$450" },
  { value: "6", label: "$630" },
  { value: "D", label: "$1100" },
];

const Controlled = ({ initial, ...args }) => {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-72">
      <Combobox
        aria-label="Train"
        {...args}
        value={value}
        onValueChange={setValue}
        onSelect={(option) => setValue(option.value)}
      />
    </div>
  );
};

export default {
  title: "Chrome/Combobox",
  component: Combobox,
  // An interface component, not an svg of the print pages
  parameters: { layout: "centered", chrome: true },
  render: (args) => <Controlled {...args} />,
  args: { options: trains, initial: "", emptyText: "No matches" },
};

export const Empty = {};

export const WithValue = { args: { initial: "4" } };

export const LongList = {
  args: {
    options: Array.from({ length: 40 }, (_, i) => ({
      value: `Company ${i + 1}`,
      label: `C${i + 1}`,
    })),
  },
};
