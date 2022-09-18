'use strict';

import * as path from 'path';
import { fileURLToPath } from 'url';
import webExt from 'web-ext';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pluginName = 'WebExtPlugin';

export default class WebExtPlugin {
  constructor({
    sourceDir = process.cwd(),
    artifactsDir = path.join(sourceDir, 'web-ext-artifacts'),
    browserConsole = false,
    buildPackage = false,
    chromiumBinary,
    chromiumProfile,
    firefox,
    firefoxPreview,
    firefoxProfile,
    keepProfileChanges,
    outputFilename,
    overwriteDest = false,
    profileCreateIfMissing,
    runLint = true,
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
    this.firefoxPreview = firefoxPreview;
    this.firefoxProfile = firefoxProfile;
    this.keepProfileChanges = keepProfileChanges;
    this.outputFilename = outputFilename;
    this.overwriteDest = overwriteDest;
    this.profileCreateIfMissing = profileCreateIfMissing;
    this.runLint = runLint;
    this.selfHosted = selfHosted;
    this.sourceDir = path.resolve(__dirname, sourceDir);
    this.startUrl = startUrl;
    this.target = target;
  }

  apply(compiler) {
    const watchRun = async (_compiler) => {
      this.watchMode = true;
    };

    const afterEmit = async (_compilation) => {
      if (this.runLint) {
        const result = await webExt.cmd.lint(
          {
            artifactsDir: this.artifactsDir,
            boring: false,
            metadata: false,
            output: 'text',
            pretty: false,
            selfHosted: this.selfHosted,
            sourceDir: this.sourceDir,
            verbose: false,
          },
          {
            shouldExitProgram: false,
          }
        );

        // Abort on any lint errors
        if (result.summary.errors) {
          throw new Error(result.errors[0].message);
        }
      }

      if (!this.watchMode) {
        if (this.buildPackage) {
          await webExt.cmd.build(
            {
              artifactsDir: this.artifactsDir,
              firefoxPreview: this.firefoxPreview,
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

      try {
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
            firefoxPreview: this.firefoxPreview,
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
