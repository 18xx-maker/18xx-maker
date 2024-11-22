import { Link as RouterLink } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import Link from "@mui/material/Link";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { publishers } from "@/data";

const GameRow = ({ game, onDelete }) => {
  let linkNode = null;
  let imageNode = null;

  if (game.publisher && publishers[game.publisher]) {
    let publisher = publishers[game.publisher];

    if (publisher.link) {
      linkNode = (
        <Link
          rel="noreferrer"
          target="_blank"
          href={publisher.link}
          underline="hover"
        >
          {publisher.name}
        </Link>
      );
    } else {
      linkNode = publisher.name;
    }

    if (game.publisher !== "self") {
      if (publisher.link) {
        imageNode = (
          <Link
            rel="noreferrer"
            target="_blank"
            href={publisher.link}
            underline="hover"
          >
            <img alt={`${publisher.name} Logo`} src={publisher.imageUrl} />
          </Link>
        );
      } else {
        imageNode = (
          <img alt={`${publisher.name} Logo`} src={publisher.imageUrl} />
        );
      }
    }
  }

  let publisherNode = (
    <>
      <TableCell>{linkNode}</TableCell>
      <TableCell style={{ textAlign: "center" }}>{imageNode}</TableCell>
    </>
  );

  return (
    <TableRow>
      <TableCell>
        <Link
          component={RouterLink}
          variant="h5"
          to={`/games/${game.slug}/map`}
          underline="hover"
        >
          {game.title}
        </Link>
        {game.subtitle && (
          <>
            <br />
            {game.subtitle}
          </>
        )}
      </TableCell>
      <TableCell>{game.designer}</TableCell>
      {publisherNode}
      <TableCell>{game.type}</TableCell>
      <TableCell>
        {onDelete && game.type !== "bundled" && (
          <DeleteIcon onClick={() => onDelete(game.slug)} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default GameRow;
