# Icon sources

The SVG files in `svg/` are copied verbatim (paths unmodified) from `@mui/icons-material` (Material Design
icons by Google), distributed under the MIT license (the MUI package) and
originally released under the Apache License 2.0 (Material Icons).

MIT License, Copyright (c) 2014 Call-Em-All

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Each file name matches the `@mui/icons-material` export it replaces
(`svg/Train.svg` replaces `@mui/icons-material/Train`). To add one, copy the
`<path>` data from that package into a new file shaped like the others
(`viewBox="0 0 24 24"`, `fill="currentColor"`, `width`/`height` of `1em`) and
export it from `index.js` with `createIcon`.

The files are excluded from the svgo pre-commit hook (`lefthook.yml`) so they
stay identical to the upstream paths.
