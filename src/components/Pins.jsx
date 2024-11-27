const Pins = ({ config, landscape = false }) => (
  <>
    <circle
      r={config.outerRadius}
      cx={landscape ? config.y : config.x1}
      cy={landscape ? config.x1 : config.y}
      fill="gray"
      strokeWidth="1"
      stroke="black"
    />
    <circle
      r={config.outerRadius}
      cx={landscape ? config.y : config.x2}
      cy={landscape ? config.x2 : config.y}
      fill="gray"
      strokeWidth="1"
      stroke="black"
    />

    <circle
      r={config.innerRadius}
      cx={landscape ? config.y : config.x1}
      cy={landscape ? config.x1 : config.y}
      fill="white"
      strokeWidth="1"
      stroke="black"
    />
    <circle
      r={config.innerRadius}
      cx={landscape ? config.y : config.x2}
      cy={landscape ? config.x2 : config.y}
      fill="white"
      strokeWidth="1"
      stroke="black"
    />
  </>
);

export default Pins;
