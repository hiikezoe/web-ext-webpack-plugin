import { Compiler } from 'webpack';

interface WebExtWebpackPluginOptions {
  sourceDir?: string;
  artifactsDir?: string;
  browserConsole?: boolean;
  firefox?: string;
  firefoxProfile?: string;
  keepProfileChanges?: boolean;
  profileCreateIfMissing?: boolean;
  startUrl?: string;
}

class WebExtWebpackPlugin {
  constructor(params: WebExtWebpackPluginOptions);

  apply(compiler: Compiler): void;
}

export = WebExtWebpackPlugin;
