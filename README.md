# web-ext-webpack-plugin
A webpack plugin for web-ext

**webpack.config.js**
```js
const WebExtWebpackPlugin = require('web-ext-webpack-plugin');

module.exports = {
  plugins: [
    new WebExtWebpackPlugin({ sourceDir: './extension-dist' })
  ]
}
```
