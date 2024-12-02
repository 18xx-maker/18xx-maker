import Toolbar from "@/components/Toolbar";

const Viewport = ({ children }) => {
  return (
    <div
      id="viewport"
      className="editor-checkered print:bg-none print:bg-white"
    >
      <Toolbar />
      {children}
    </div>
  );
};

export default Viewport;
