[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/hiikezoe/web-ext-webpack-plugin)

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
