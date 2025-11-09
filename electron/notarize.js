import { notarize } from "@electron/notarize";

const notarizing = async (context) => {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appFile = `${appName}.app`;
  const appPath = `${appOutDir}/${appFile}`;

  await notarize({
    appPath,
    appleId,
    appleIdPassword,
    teamId,
  });
};

export default notarizing;
