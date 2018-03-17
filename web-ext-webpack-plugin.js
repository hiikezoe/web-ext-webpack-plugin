'use strict';

const path = require('path');
const webExt = require('web-ext').default;

const pluginName = 'WebExtWebpackPlugin';

class WebExtWebpackPlugin {
  constructor() {
  }

  apply(compiler) {
    const sourceDir = process.cwd();
    const artifactsDir = path.join(sourceDir, 'web-ext-artifacts');

    const afterEmit = async (compilation) => {
      await webExt.cmd.lint({
        artifactsDir,
        boring: false,
        metadata: false,
        output: 'text',
        pretty: false,
        sourceDir,
        verbose: false,
        warningsAsErrors: true,
      }, {
        shouldExitProgram: false,
      });
    }

    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapPromise({ name: pluginName }, afterEmit);
    } else {
      compiler.plugin('afterEmit', afterEmit);
    }
  }
}

module.exports = WebExtWebpackPlugin;
