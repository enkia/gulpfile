# Gulp File Example

This is an example of a gulpfile.js file.

### Watches for:
1. Changes to source asset image folder.
2. Changes to source SASS files.
3. Changes to HTML files
4. Changes to source Javascript files and libraries.
5. Changes to all source files and uses Browsersync (optionally) to auto refresh the browser.

### Builds:
1. Moves any new images to production location.
2. Compiles SASS files into CSS and adds neccessary browser prefixes.
3. Moves and renames HTML files to *.tpl
4. Concatenates and Uglifies JavaScript files.
5. Builds source maps for both CSS and JS files.
6. Builds production ready files with the `--production` argument.
7. Uploads production ready files with the `--production --ftp` argument.

### Commands
```bash
gulp
gulp --browsersync
gulp build
gulp build --production
gulp build --production --ftp
```
