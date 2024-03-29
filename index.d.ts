import { Compiler } from 'webpack';

export type TargetType = 'firefox-desktop' | 'firefox-android' | 'chromium';

export type LintMatcher = {
  code?: string;
  message?: string;
  file?: string;
}

export declare interface WebExtPluginOptions {
  args?: Array<string>;
  artifactsDir?: string;
  browserConsole?: boolean;
  buildPackage?: boolean;
  chromiumBinary?: string;
  chromiumProfile?: string;
  devtools?: boolean;
  firefox?: string;
  firefoxPreview?: ['mv3'];
  firefoxProfile?: string;
  ignoreFiles?: Array<string>;
  keepProfileChanges?: boolean;
  noInput?: boolean;
  outputFilename?: string;
  overwriteDest?: boolean;
  pref?: { [key: string]: boolean | string | number };
  profileCreateIfMissing?: boolean;
  runLint?: boolean;
  lintWarningsAsErrors?: boolean;
  ignoreKnownChromeLintFailures?:boolean;
  filterLintFailures?: Array<LintMatcher>;
  selfHosted?: boolean;
  sourceDir?: string;
  startUrl?: string | Array<string>;
  target?: TargetType | Array<TargetType>;
  adbBin?: string;
  adbHost?: string;
  adbPort?: string;
  adbDevice?: string;
  adbDiscoveryTimeout?: number;
  adbRemoveOldArtifacts?: boolean;
  firefoxApk?: string;
  firefoxApkComponent?: string;
}

export default class WebExtPlugin {
  constructor(params: WebExtPluginOptions);

  apply(compiler: Compiler): void;
}
