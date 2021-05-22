'use strict';

const path = require('path');
const webExt = require('web-ext');

const pluginName = 'WebExtPlugin';

class WebExtPlugin {
  constructor({
    sourceDir = process.cwd(),
    artifactsDir = path.join(sourceDir, 'web-ext-artifacts'),
    browserConsole = false,
    chromiumBinary,
    chromiumProfile,
    firefox,
    firefoxProfile,
    keepProfileChanges,
    profileCreateIfMissing,
    startUrl,
    target,
  } = {}) {
    this.runner = null;
    this.watchMode = false;
    this.artifactsDir = artifactsDir;
    this.browserConsole = browserConsole;
    this.chromiumBinary = chromiumBinary;
    this.chromiumProfile = chromiumProfile;
    this.firefox = firefox;
    this.firefoxProfile = firefoxProfile;
    this.keepProfileChanges = keepProfileChanges;
    this.profileCreateIfMissing = profileCreateIfMissing;
    this.sourceDir = path.resolve(__dirname, sourceDir);
    this.startUrl = startUrl;
    this.target = target;
  }

  apply(compiler) {
    const watchRun = async (compiler) => {
      this.watchMode = true;
    };

    const afterEmit = async (compilation) => {
      try {
        await webExt.cmd.lint(
          {
            artifactsDir: this.artifactsDir,
            boring: false,
            metadata: false,
            output: 'text',
            pretty: false,
            sourceDir: this.sourceDir,
            verbose: false,
            warningsAsErrors: true,
          },
          {
            shouldExitProgram: false,
          }
        );

        if (!this.watchMode) {
          return;
        }

        if (this.runner) {
          this.runner.reloadAllExtensions();
          return;
        }

        await webExt.cmd
          .run(
            {
              artifactsDir: this.artifactsDir,
              browserConsole: this.browserConsole,
              sourceDir: this.sourceDir,
              target: this.target,
              chromiumBinary: this.chromiumBinary,
              chromiumProfile: this.chromiumProfile,
              firefox: this.firefox,
              firefoxProfile: this.firefoxProfile,
              keepProfileChanges: this.keepProfileChanges,
              profileCreateIfMissing: this.profileCreateIfMissing,
              startUrl: this.startUrl,
              noReload: true,
            },
            {}
          )
          .then((runner) => (this.runner = runner));

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

module.exports = WebExtPlugin;
