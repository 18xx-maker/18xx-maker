# SVG Company Logos

By default this program uses plain color backgrounds and text labels to make
company tokens. If desired you may use
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) logos instead. SVG is
the only format supported.

## Company Logo Options

There are four settings for the "Company Logos" option on the [config](/config)
page:

- `none` - This is the default setting. This doesn't use SVG's and renders
  tokens as plain text with a company color background.
- `original` - This uses the provided company SVG files with no editing on a
  white background.
- `match` - This uses the provided company SVG file but switches every color
  with closest color from the currently selected company theme.
- `main` - This uses the provided company SVG file just like `match` but also
  changes the main color of the logo to the company color defined in the game's
  json file.

Here are some examples, `none`, `original`, `match`, and finally `main`:

![none](/images/company-none.png)
![original](/images/company-original.png)
![match](/images/company-match.png)
![main](/images/company-main.png)

## Creating the SVG files

You can use any normal SVG program or method to create the SVGs needed for
`original` mode. The only important part is to set the viewBox / Document
bounding box to be a tight box containing a circle. I recommend using a circle
(even if you remove it before saving) to know how the logo will look when
displayed in a circle city.

Also remember that the logo will be on a white background. If you want the logo
to have a solid background color I recommend allowing that color to bleed past
the viewBox so that it works nicely when printing tokens.

### Color Editing

In order for the color options above to work you need to add class attributes to
anything that is a color. For anything that has a `fill` of a color add a
`color-<name>` class. For instance, anything in the logo that is red should have
a class of `color-red`.

Anything that is the "main" color of a logo should ALSO have a class of
`color-main`.

Anything that has a stroke color should include `color-stroke-<name>` and if
relevant `color-stroke-main` as well (for example: `color-stroke-purple`).

## Adding logos

Name the logo based on the company abbreviation you want it to be for and drop
it in the
[/src/data/logos](https://github.com/18xx-maker/18xx-maker/tree/master/src/data/logos)
folder. Once this is done you should **make sure you have a backup** and run:

```sh
yarn svgo
```

This will optimize the SVG and remove anything unnessecary from it. This is
required to make sure the react app can load it. After you run this please check
your SVG and make sure it still looks right. If it doesn't or you have issues
please [let me know](mailto:kelsin@valefor.com).

You also need to run:

```sh
yarn generate:logos:index
```

to auto generate an `index.js` file with all of the logos. We used to have to
edit this file by hand but this is easier. This will be run automatically as
part of `yarn build`.
