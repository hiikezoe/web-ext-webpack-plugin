import { Compiler } from 'webpack';

export declare interface WebExtPluginOptions {
  artifactsDir?: string;
  browserConsole?: boolean;
  buildPackage?: boolean;
  chromiumBinary?: string;
  chromiumProfile?: string;
  firefox?: string;
  firefoxProfile?: string;
  keepProfileChanges?: boolean;
  outputFilename?: string;
  overwriteDest?: boolean;
  profileCreateIfMissing?: boolean;
  selfHosted?: boolean;
  sourceDir?: string;
  startUrl?: string;
  target?: 'firefox-desktop' | 'firefox-android' | 'chromium';
}

export default class WebExtPlugin {
  constructor(params: WebExtPluginOptions);

  apply(compiler: Compiler): void;
}
