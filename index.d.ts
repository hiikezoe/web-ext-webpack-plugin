import { Compiler } from 'webpack';

interface WebExtPluginOptions {
  sourceDir?: string;
  artifactsDir?: string;
  browserConsole?: boolean;
  firefox?: string;
  firefoxProfile?: string;
  keepProfileChanges?: boolean;
  profileCreateIfMissing?: boolean;
  startUrl?: string;
}

class WebExtPlugin {
  constructor(params: WebExtPluginOptions);

  apply(compiler: Compiler): void;
}

export = WebExtPlugin;
