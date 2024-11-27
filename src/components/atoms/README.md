# Atoms

The components in this folder should all conform to the following rules:

1. These components should not involve any state. Just a pure props to render
   transition.
2. They are all supposed to be rendered inside of an SVG element, **NOT** html.

## Folders

- **shapes** - Components in this folder are meant to be generic shapes with
  text in them. All props should follow the same standard and there should be no
  behavior associated with them. They should be used in other atoms to make
  meaningful items. For example a `shapes/Square.jsx` can be used to render a
  `Good.jsx`. The square should only take `text`, `width` and `colors` props
  while the good component can take in a `cost` or `price` value as appropriate.
