import styles from "./Pagination.module.css";
import cx from "./cx";
import { ChevronLeft, ChevronRight } from "./icons";

const range = (start, end) =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

// The page numbers to show: the first and last (boundaryCount) pages, the
// current page with siblingCount on each side, and an ellipsis for each gap.
// Same arithmetic as MUI's usePagination, so the same pages show.
export const pageItems = (page, count, boundaryCount = 1, siblingCount = 1) => {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(
    Math.max(count - boundaryCount + 1, boundaryCount + 1),
    count,
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ["start-ellipsis"]
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ["end-ellipsis"]
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
};

// MUI's Pagination, large and primary (the only look the app uses): previous
// and next buttons around the page numbers, the current one has
// aria-current="true" as MUI does. page is 1-based,
// onChange(event, page) like MUI. labels names the nav, the buttons and the
// pages (English by default): { nav, previous, next, page(n), goTo(n) }.
const defaultLabels = {
  nav: "pagination navigation",
  previous: "Go to previous page",
  next: "Go to next page",
  page: (n) => `page ${n}`,
  goTo: (n) => `Go to page ${n}`,
};

const Pagination = ({
  page = 1,
  count = 1,
  onChange,
  labels,
  className,
  ...props
}) => {
  const text = { ...defaultLabels, ...labels };
  const go = (event, value) => onChange?.(event, value);

  return (
    <nav
      aria-label={text.nav}
      className={className}
      data-chrome="pagination"
      {...props}
    >
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={styles.item}
            aria-label={text.previous}
            disabled={page <= 1}
            onClick={(e) => go(e, page - 1)}
          >
            <ChevronLeft fontSize="inherit" className={styles.icon} />
          </button>
        </li>
        {pageItems(page, count).map((item) => (
          <li key={item}>
            {typeof item === "number" ? (
              <button
                type="button"
                className={cx(styles.item, item === page && styles.selected)}
                aria-label={item === page ? text.page(item) : text.goTo(item)}
                aria-current={item === page ? "true" : undefined}
                onClick={(e) => go(e, item)}
              >
                {item}
              </button>
            ) : (
              <div className={cx(styles.item, styles.ellipsis)}>…</div>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            className={styles.item}
            aria-label={text.next}
            disabled={page >= count}
            onClick={(e) => go(e, page + 1)}
          >
            <ChevronRight fontSize="inherit" className={styles.icon} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
