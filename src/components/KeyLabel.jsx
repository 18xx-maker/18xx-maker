// A label with its single key shortcut underlined. The key is underlined in
// the first match inside `word` (default: the whole text). When the label has
// no such letter, or `append` is set, the key is added in parentheses and
// hidden from assistive technology, so accessible names stay the label.
const KeyLabel = ({ text, shortcut, word, append = false }) => {
  const start = append ? -1 : text.indexOf(word ?? text);
  const at =
    start < 0
      ? -1
      : text
          .slice(start, start + (word ?? text).length)
          .toLowerCase()
          .indexOf(shortcut.toLowerCase());

  if (at < 0) {
    return (
      <>
        {text}
        <span aria-hidden="true">
          {" ("}
          <u>{shortcut}</u>
          {")"}
        </span>
      </>
    );
  }

  const index = start + at;

  return (
    <>
      {text.slice(0, index)}
      <u>{text[index]}</u>
      {text.slice(index + 1)}
    </>
  );
};

export default KeyLabel;
