import { createContext, forwardRef, useContext } from "react";

import styles from "./Table.module.css";
import cx from "./cx";

// Table family: Table, TableContainer, TableHead, TableBody, TableRow,
// TableCell. They keep MUI's props (size="small", stickyHeader, align) on the
// native elements. The table and its head tell their cells what they are
// through context, like MUI.
const TableContext = createContext({ size: "medium", stickyHeader: false });
const SectionContext = createContext(null);

export const Table = forwardRef(
  ({ size = "medium", stickyHeader = false, className, ...props }, ref) => (
    <TableContext.Provider value={{ size, stickyHeader }}>
      <table
        ref={ref}
        className={cx(
          styles.table,
          stickyHeader && styles.tableSticky,
          className,
        )}
        {...props}
      />
    </TableContext.Provider>
  ),
);
Table.displayName = "Table";

export const TableContainer = forwardRef(
  ({ component: Component = "div", className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cx(styles.container, className)}
      {...props}
    />
  ),
);
TableContainer.displayName = "TableContainer";

export const TableHead = forwardRef(({ className, ...props }, ref) => (
  <SectionContext.Provider value="head">
    <thead ref={ref} className={cx(styles.head, className)} {...props} />
  </SectionContext.Provider>
));
TableHead.displayName = "TableHead";

export const TableBody = forwardRef(({ className, ...props }, ref) => (
  <SectionContext.Provider value="body">
    <tbody ref={ref} className={cx(styles.body, className)} {...props} />
  </SectionContext.Provider>
));
TableBody.displayName = "TableBody";

export const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cx(styles.row, className)} {...props} />
));
TableRow.displayName = "TableRow";

// align: "left" (default) | "center" | "right"
export const TableCell = forwardRef(({ align, className, ...props }, ref) => {
  const { size, stickyHeader } = useContext(TableContext);
  const section = useContext(SectionContext);
  const head = section === "head";
  const Component = head ? "th" : "td";
  return (
    <Component
      ref={ref}
      scope={head ? "col" : undefined}
      className={cx(
        styles.cell,
        head ? styles.cellHead : styles.cellBody,
        size === "small" && styles.cellSmall,
        align && styles[`align-${align}`],
        head && stickyHeader && styles.cellSticky,
        className,
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";
