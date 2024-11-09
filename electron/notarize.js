import { notarize } from "@electron/notarize";

async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  if (!process.env.APPLEIDPASS) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appBundleId: "com.18xx-maker.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "kelsin@valefor.com",
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: "4A6F4V2PM5",
  });
}

export default notarizing;
