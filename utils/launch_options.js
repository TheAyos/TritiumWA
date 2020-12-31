/**
 * @param {boolean} headless Whether run in headless mode or not
 * @param {function} callback Callback function if client crashes
 */
module.exports = options = (headless, callback) => {
  const options = {
    sessionId: "tritiumCarteVitale",
    headless: headless,
    autoRefresh: true,
    restartOnCrash: callback,
    cacheEnabled: false,
    //executablePath: execPath,
    //useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    chromiumArgs: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--aggressive-cache-discard",
      "--disable-cache",
      "--disable-application-cache",
      "--disable-offline-load-stale-cache",
      "--disk-cache-size=0" /*,
            '--disable-breakpad',
            '--disable-component-update',
            '--disable-hang-monitor',
            '--disable-logging',
            '--disable-print-preview',
            '--disable-metrics',
            '--disable-metrics-reporting',
            '--disable-dev-tools',
            '--ssl-version-min=tl'*/,
    ],
  };

  return options;
};
