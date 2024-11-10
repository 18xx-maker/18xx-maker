import { execSync } from "node:child_process";

const run = (command) => {
  try {
    execSync(command, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (err) {
    if (err.code) {
      // Error spawning the process at all
      throw err;
    } else {
      // Child process ran fine but exited with a non-zero exit code
      const { stdout, stderr } = err;
      console.error({ stdout, stderr });
    }
  }
};

const notarizing = async (context) => {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;
  const zipPath = `${appOutDir}/${appName}.zip`;
  const appleId = process.env.APPLE_ID;
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;

  if (!appleId || !appleTeamId || !applePassword) {
    return;
  }

  console.log(`Creating ${zipPath} from ${appPath}`);
  run(`ditto -c -k --keepParent "${appPath}" "${zipPath}"`);

  console.log(`Submitting ${zipPath} for notarizing`);
  run(
    `xcrun notarytool submit "${zipPath}" --team-id "${appleTeamId}" --apple-id "${appleId}" --password "${applePassword}" --wait`,
  );

  console.log(`Stapling ticket to ${appPath}`);
  run(`xcrun stapler staple "${appPath}"`);
};

export default notarizing;
