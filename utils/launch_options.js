/**
 * @param {boolean} headless Whether run in headless mode or not
 * @param {function} callback Callback function if client crashes
 */
module.exports = (headless, callback) => {
  return {
    sessionId: "tritiumCarteVitale",
    headless: headless,
    autoRefresh: true,
    restartOnCrash: callback,
    cacheEnabled: false,
    useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    customUserAgent:
      "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    logConsole: false,
    chromiumArgs: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--aggressive-cache-discard",
      "--disable-cache",
      "--disable-application-cache",
      "--disable-offline-load-stale-cache",
      "--disk-cache-size=0",
      /* ,
            '--disable-breakpad',
            '--disable-component-update',
            '--disable-hang-monitor',
            '--disable-logging',
            '--disable-print-preview',
            '--disable-metrics',
            '--disable-metrics-reporting',
            '--disable-dev-tools',
            '--ssl-version-min=tl'*/
    ],
  };
};
