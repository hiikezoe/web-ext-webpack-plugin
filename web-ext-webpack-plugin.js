'use strict';

const path = require('path');
const webExt = require('web-ext').default;

const pluginName = 'WebExtWebpackPlugin';

class WebExtWebpackPlugin {
  constructor() {
  }

  apply(compiler) {
    const sourceDir = process.cwd();
    const artifactsDir = path.join(process.cwd(), 'web-ext-artifacts');

    const done = async (stats) => {
      if (stats.hasErrors()) {
        return;
      }
      return webExt.cmd.lint({
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
      compiler.hooks.done.tapPromise({ name: pluginName }, done);
    } else {
      compiler.plugin('done', done);
    }
  }
}

module.exports = WebExtWebpackPlugin;
