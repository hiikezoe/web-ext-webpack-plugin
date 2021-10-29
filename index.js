'use strict';

const path = require('path');
const webExt = require('web-ext');

const pluginName = 'WebExtPlugin';

class WebExtPlugin {
  constructor({
    sourceDir = process.cwd(),
    artifactsDir = path.join(sourceDir, 'web-ext-artifacts'),
    browserConsole = false,
    buildPackage = false,
    chromiumBinary,
    chromiumProfile,
    firefox,
    firefoxProfile,
    keepProfileChanges,
    outputFilename,
    overwriteDest = false,
    profileCreateIfMissing,
    selfHosted = false,
    startUrl,
    target,
  } = {}) {
    this.runner = null;
    this.watchMode = false;

    this.artifactsDir = artifactsDir;
    this.browserConsole = browserConsole;
    this.buildPackage = buildPackage;
    this.chromiumBinary = chromiumBinary;
    this.chromiumProfile = chromiumProfile;
    this.firefox = firefox;
    this.firefoxProfile = firefoxProfile;
    this.keepProfileChanges = keepProfileChanges;
    this.outputFilename = outputFilename;
    this.overwriteDest = overwriteDest;
    this.profileCreateIfMissing = profileCreateIfMissing;
    this.selfHosted = selfHosted;
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
            selfHosted: this.selfHosted,
            sourceDir: this.sourceDir,
            verbose: false,
            warningsAsErrors: true,
          },
          {
            shouldExitProgram: false,
          }
        );

        if (!this.watchMode) {
          if (this.buildPackage) {
            await webExt.cmd.build(
              {
                artifactsDir: this.artifactsDir,
                filename: this.outputFilename,
                overwriteDest: this.overwriteDest,
                sourceDir: this.sourceDir,
              },
              {
                shouldExitProgram: true,
              }
            );
          }

          return;
        }

        if (this.runner) {
          this.runner.reloadAllExtensions();
          return;
        }

        this.runner = await webExt.cmd.run(
          {
            artifactsDir: this.artifactsDir,
            browserConsole: this.browserConsole,
            chromiumBinary: this.chromiumBinary,
            chromiumProfile: this.chromiumProfile,
            firefox: this.firefox,
            firefoxProfile: this.firefoxProfile,
            keepProfileChanges: this.keepProfileChanges,
            noReload: true,
            profileCreateIfMissing: this.profileCreateIfMissing,
            sourceDir: this.sourceDir,
            startUrl: this.startUrl,
            target: this.target,
          },
          {}
        );

        if (!this.runner) {
          return;
        }

        this.runner.registerCleanup(() => {
          this.runner = null;

          if (compiler.watching && !compiler.watching.closed) {
            compiler.watching.close((closeErr) => {
              if (closeErr) {
                console.error(closeErr);
              }
            });
          }
        });
      } catch (err) {
        console.error(err);
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
