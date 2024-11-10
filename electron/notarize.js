import { execSync } from "node:child_process";

async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  if (!process.env.APPLEIDPASS) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;
  const zipPath = `${appOutDir}/${appName}.zip`;
  const appleId = "kelsin@valefor.com";
  const appleIdPassword = process.env.APPLEIDPASS;
  const teamId = "4A6F4V2PM5";

  console.log(
    execSync(`ditto -c -k --keepParent "${appPath}" "${zipPath}"`, {
      encoding: "utf8",
    }),
  );

  console.log(
    execSync(
      `xcrun notarytool submit "${zipPath}" --team-id "${teamId}" --apple-id "${appleId}" --password "${appleIdPassword}" --wait`,
      { encoding: "utf8" },
    ),
  );

  console.log(
    execSync(`xcrun stapler staple "${appPath}"`, { encoding: "utf8" }),
  );
}

export default notarizing;
