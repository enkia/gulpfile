# Gulp File Example

This is an example of a gulpfile.js

### Watches for:
1. Changes to source asset image folder.
2. Changes to source SASS files.
3. Changes to source Javascript files and libraries.
4. Changes to all source files and uses Browsersync to auto refresh the browser. 

###Builds
1. Moves any new images to production location.
2. Compiles SASS files into CSS and adds neccessary browser prefixes. 
3. Concatenates and Uglifies JavaScript files.
4. Builds source maps for both CSS and JS files.
4. Builds production ready files with the `--production` argument. 

###Commands
```bash
gulp
gulp build 
gulp build --production
```