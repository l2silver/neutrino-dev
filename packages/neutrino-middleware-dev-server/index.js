const { pathOr } = require('ramda');
const opn = require('opn');

module.exports = (neutrino, options = {}) => {
  const { config } = neutrino;
  const server = pathOr({}, ['options', 'server'], neutrino);
  const protocol = process.env.HTTPS ? 'https' : 'http';
  const publicHost = process.env.HOST;
  const port = process.env.PORT || server.port || options.port || 5000;
  const https = (protocol === 'https') || server.https || options.https;
  let openInBrowser = false;
  let serverPublic = false;
  let host = 'localhost';

  if (server.public !== undefined) {
    serverPublic = Boolean(server.public);
  } else if (options.public !== undefined) {
    serverPublic = Boolean(options.public);
  }

  if (serverPublic) {
    host = '0.0.0.0';
  }

  if (server.open !== undefined) {
    openInBrowser = Boolean(server.open);
  } else if (options.open !== undefined) {
    openInBrowser = Boolean(options.open);
  }

  config
    .devServer
      .host(String(host))
      .port(Number(port))
      .https(Boolean(https))
      .contentBase(neutrino.options.source)
      .historyApiFallback(true)
      .hot(true)
      .headers({ host: publicHost })
      .public(publicHost)
      .publicPath('/')
      .stats({
        assets: false,
        children: false,
        chunks: false,
        colors: true,
        errors: true,
        errorDetails: true,
        hash: false,
        modules: false,
        publicPath: false,
        timings: false,
        version: false,
        warnings: true
      })
      .when(openInBrowser, devServer => neutrino.on('start', () => {
        const https = devServer.get('https');
        const protocol = https ? 'https' : 'http';
        const host = devServer.get('host');
        const port = devServer.get('port');
        const endHost = (host === '0.0.0.0') ? publicHost : host;
        opn(`${protocol}://${endHost}:${port}`);
      }))
      .end()
    .entry('index')
      .prepend(require.resolve('webpack/hot/dev-server'))
      .prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`);
};