import { Compiler } from 'webpack';

export declare interface WebExtPluginOptions {
  sourceDir?: string;
  artifactsDir?: string;
  browserConsole?: boolean;
  chromiumBinary?: string;
  chromiumProfile?: string;
  firefox?: string;
  firefoxProfile?: string;
  keepProfileChanges?: boolean;
  profileCreateIfMissing?: boolean;
  startUrl?: string;
  target?: 'firefox-desktop' | 'firefox-android' | 'chromium';
  buildPackage?: boolean;
  overwriteDest?: boolean;
  outputFilename?: string;
}

export default class WebExtPlugin {
  constructor(params: WebExtPluginOptions);

  apply(compiler: Compiler): void;
}
