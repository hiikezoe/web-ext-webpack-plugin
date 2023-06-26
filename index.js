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
    devtools = false,
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
    ignoreKnownChromeLintFailures = false,
    filterLintFailures = [],
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
    this.devtools = devtools;
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
    this.ignoreKnownChromeLintFailures = ignoreKnownChromeLintFailures;
    this.filterLintFailures = filterLintFailures;
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
            firefoxPreview: this.firefoxPreview,
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

        let lintSummary = result.summary
        let lintErrors = result.errors;

        if (this.lintWarningsAsErrors) {
          lintSummary.errors += lintSummary.warnings;
          lintSummary.warnings = 0;
          lintErrors.push(...result.warnings)
        }

        function checkFilterMatch(filter, message) {
          for (const field of Object.keys(filter)) {
            if (!field || message[field] !== filter[field]) {
              return false;
            }
          }
          return true;
        }

        if (this.ignoreKnownChromeLintFailures) {
          //add known failures caused by differences in chrome and firefox manifests
          this.filterLintFailures.push({
            code: "MANIFEST_FIELD_UNSUPPORTED",
            message: '"/background" is in an unsupported format.'
          });
        }
        
        if (this.filterLintFailures) {
          for (const filter of this.filterLintFailures) {
            lintErrors = lintErrors.filter((value, index) =>
              !checkFilterMatch(filter, value)
            )
          }
        }


        // Abort on any lint errors or warnings if lintWarningsAsErrors is true
        if (lintSummary.errors) {
          throw new Error(lintErrors[0].message);
        } else if (this.lintWarningsAsErrors && lintSummary.warnings) {
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
            devtools: this.devtools,
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
