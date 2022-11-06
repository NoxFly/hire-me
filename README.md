# Live AI Interview

## Technologies

* Nodejs >= 14 (if possible 16)
* Express 4.18
* EJS 3.1
* Socket.io 4.5
* TensorFlow-Node 4.0

Typescript on server-side, module javascript on client-side.

## Run


```sh
# use this script to install and configure dependencies
./install.sh
# run the server
npm run dev
# http://localhost:3000
```

## CSS

**Do not write on .css files !!!**<br>
Only modify *.scss*, and use the [Live Sass](https://marketplace.visualstudio.com/items?itemName=glenn2223.live-sass) extension to compile it from VSC.<br>
Visual Studio Code settings have already be written so it will automatically compile and compress on the css folder. Just think to start the live sass extension at the bottom-right of your VSC workspace (click "Watch Sass").

style.css is the included file. So when you save another scss file, you have to ctrl+s style.scss to apply global changes.

When a page is included, with a `/path/to/file.ejs`, it has the `.page-path-to-file` class.