import { Compiler } from 'webpack';

interface WebExtPluginOptions {
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
}

class WebExtPlugin {
  constructor(params: WebExtPluginOptions);

  apply(compiler: Compiler): void;
}

export = WebExtPlugin;
