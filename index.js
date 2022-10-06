'use strict';

import * as path from 'path';
import { fileURLToPath } from 'url';
import webExt from 'web-ext';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pluginName = 'WebExtPlugin';

export default class WebExtPlugin {
  constructor({
    sourceDir = process.cwd(),
    args,
    artifactsDir = path.join(sourceDir, 'web-ext-artifacts'),
    browserConsole = false,
    buildPackage = false,
    chromiumBinary,
    chromiumProfile,
    firefox,
    firefoxPreview,
    firefoxProfile,
    ignoreFiles = [],
    keepProfileChanges,
    noInput,
    outputFilename,
    overwriteDest = false,
    pref,
    profileCreateIfMissing,
    runLint = true,
    lintWarningsAsErrors = false,
    selfHosted = false,
    startUrl,
    target,
    adbBin,
    adbHost,
    adbPort,
    adbDevice,
    adbDiscoveryTimeout,
    adbRemoveOldArtifacts,
    firefoxApk,
    firefoxApkComponent,
  } = {}) {
    this.runner = null;
    this.watchMode = false;

    this.args = args;
    this.artifactsDir = artifactsDir;
    this.browserConsole = browserConsole;
    this.buildPackage = buildPackage;
    this.chromiumBinary = chromiumBinary;
    this.chromiumProfile = chromiumProfile;
    this.firefox = firefox;
    this.firefoxPreview = firefoxPreview;
    this.firefoxProfile = firefoxProfile;
    this.ignoreFiles = ignoreFiles;
    this.keepProfileChanges = keepProfileChanges;
    this.noInput = noInput;
    this.outputFilename = outputFilename;
    this.overwriteDest = overwriteDest;
    this.pref = pref;
    this.profileCreateIfMissing = profileCreateIfMissing;
    this.runLint = runLint;
    this.lintWarningsAsErrors = lintWarningsAsErrors;
    this.selfHosted = selfHosted;
    this.sourceDir = path.resolve(__dirname, sourceDir);
    this.startUrl = startUrl;
    this.target = target;
    this.adbBin = adbBin;
    this.adbHost = adbHost;
    this.adbPort = adbPort;
    this.adbDevice = adbDevice;
    this.adbDiscoveryTimeout = adbDiscoveryTimeout;
    this.adbRemoveOldArtifacts = adbRemoveOldArtifacts;
    this.firefoxApk = firefoxApk;
    this.firefoxApkComponent = firefoxApkComponent;
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
            ignoreFiles: this.ignoreFiles,
            verbose: false,
          },
          {
            shouldExitProgram: false,
          }
        );

        // Abort on any lint errors or warnings if lintWarningsAsErrors is true
        if (result.summary.errors) {
          throw new Error(result.errors[0].message);
        } else if (this.lintWarningsAsErrors && result.summary.warnings) {
          throw new Error(result.warnings[0].message);
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
              ignoreFiles: this.ignoreFiles,
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
            args: this.args,
            artifactsDir: this.artifactsDir,
            browserConsole: this.browserConsole,
            chromiumBinary: this.chromiumBinary,
            chromiumProfile: this.chromiumProfile,
            firefox: this.firefox,
            firefoxPreview: this.firefoxPreview,
            firefoxProfile: this.firefoxProfile,
            ignoreFiles: this.ignoreFiles,
            keepProfileChanges: this.keepProfileChanges,
            noInput: this.noInput ?? !this.watchMode,
            noReload: true,
            pref: this.pref,
            profileCreateIfMissing: this.profileCreateIfMissing,
            sourceDir: this.sourceDir,
            startUrl: this.startUrl,
            target: this.target,
            adbBin: this.adbBin,
            adbHost: this.adbHost,
            adbPort: this.adbPort,
            adbDevice: this.adbDevice,
            adbDiscoveryTimeout: this.adbDiscoveryTimeout,
            adbRemoveOldArtifacts: this.adbRemoveOldArtifacts,
            firefoxApk: this.firefoxApk,
            firefoxApkComponent: this.firefoxApkComponent,
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
