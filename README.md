# web-ext-webpack-plugin

A webpack plugin for running web-ext

## Basic usage

```bash
$ npm install --save-dev web-ext-webpack-plugin

# Or for yarn
$ yarn install -D web-ext-webpack-plugin
```

**webpack.config.js**

```js
const WebExtWebpackPlugin = require('web-ext-webpack-plugin');

module.exports = {
  plugins: [new WebExtWebpackPlugin({ sourceDir: 'extension-dist' })],
};
```

## Options

- `sourceDir` (optional) - The folder where webpack is building your extension
  to.
  Typically this will be where you have configured `output.path` to point to.
  Relative paths will be resolved relative to the `webpack.config.js` file.
  Defaults to the same folder as the `webpack.config.js` file.

- `artifactsDir` (optional) - The folder where artifacts are built stored.
  Defaults to `<sourceDir>/web-ext-artifacts`.
  You typically won't need to alter this.

- `browserConsole` (optional) - A boolean indicating if the browser console
  should be shown on load.
  Defaults to false.

- `firefox` (optional) - A path to a specific version of Firefox to run.
  The value is an absolute path to the Firefox executable or an alias string.

- `firefoxProfile` (optional) - A specific Firefox profile to use.
  This may be either a profile name or the path to a profile directory.
  If this is not set a new profile is generated each time.

- `profileCreateIfMissing` (optional) - A boolean value indicating if the
  profile specified by `firefoxProfile` should be created if it does not
  exist.

  Note that if this is specified, `firefoxProfile` is treated as meaning a directory path (not a profile name).

  Defaults to false.

- `keepProfileChanges` (optional) - A boolean value indicating if the profile
  specified by `firefoxProfile`.

  Defaults to false.

  See the notes for the [`--keep-profile-changes` flag](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run) from the `web-ext run` documentation.
  Specifically, this should not be used together with a profile you later use for browsing.
  It is, however, useful if you want to force the profile in a specific location to be written to (e.g. for testing out-of-disk space situations).

- `startUrl` (optional) - A URL to load on startup.
