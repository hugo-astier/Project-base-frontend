# Project-base-frontend

> - The following commands must be run in **Project-base-frontend** directory.
> - Node.js version >= 8.0.0 has to be installed on your system.

## 1. Install global npm packages & dependencies
```
npm install -g gulp
npm install -g http-server
npm install
```

## 3. Build
```
gulp build
```

## 4. Watch changes and enable hot reloading

Install LiveReload extension for your browser (Chrome: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)

Run default Gulp task:
```
gulp
```
And then start your server:
```
cd dist
http-server -c-1
```
Make sure the LiveReload extension is enabled in your browser otherwise your browser won't refresh automatically.

## 5. Start coding :)
This project base is suitable for any new front-end web development project.

Basically, it:
- Compiles, minifies sass and css files
- Transpile JS in ES5. Allows using ES6 completely, including the import feature
- Generate favicons
- Minifies images
- Import Fontello fonts from a config.json file
- Watch for change and automatically refresh the browser

I made an example page so it's easy to see how it works, and provided an opinionated sass files tree structure.

Have a look in package.json and gulpfile.js to see what's under the hood. Happy coding :)
