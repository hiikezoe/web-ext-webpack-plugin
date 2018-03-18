'use strict';

const path = require('path');
const webExt = require('web-ext').default;

const pluginName = 'WebExtWebpackPlugin';

class WebExtWebpackPlugin {
  constructor() {
    this.runner = null;
    this.watchMode = false;
  }

  apply(compiler) {
    const sourceDir = process.cwd();
    const artifactsDir = path.join(sourceDir, 'web-ext-artifacts');

    const watchRun = async (compiler) => {
      this.watchMode = true;
    };

    const afterEmit = async (compilation) => {
      try {
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

        if (!this.watchMode) {
          return;
        }

        if (this.runner) {
          this.runner.reloadAllExtensions();
          return;
        }

        await webExt.cmd.run({
          sourceDir,
          artifactsDir,
          noReload: true,
        }, { }).then((runner) => this.runner = runner);

        if (!this.runner) {
          return;
        }

        this.runner.registerCleanup(() => {
          this.runner = null;
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapPromise({ name: pluginName }, afterEmit);
      compiler.hooks.watchRun.tapPromise({ name: pluginName }, watchRun);
    } else {
      compiler.plugin('afterEmit', afterEmit);
      compiler.plugin('watchRun', watchRun);
    }
  }
}

module.exports = WebExtWebpackPlugin;
