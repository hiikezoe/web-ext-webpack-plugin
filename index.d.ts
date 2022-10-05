import { Compiler } from 'webpack';

export type TargetType = 'firefox-desktop' | 'firefox-android' | 'chromium';

export declare interface WebExtPluginOptions {
  artifactsDir?: string;
  browserConsole?: boolean;
  buildPackage?: boolean;
  chromiumBinary?: string;
  chromiumProfile?: string;
  firefox?: string;
  firefoxPreview?: ['mv3'];
  firefoxProfile?: string;
  keepProfileChanges?: boolean;
  outputFilename?: string;
  overwriteDest?: boolean;
  profileCreateIfMissing?: boolean;
  runLint?: boolean;
  lintWarningsAsErrors?: boolean,
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
