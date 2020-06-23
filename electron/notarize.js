const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  if (!process.env.APPLEIDPASS) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "com.18xx-maker.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "kelsin@valefor.com",
    appleIdPassword: process.env.APPLEIDPASS,
  });
};
