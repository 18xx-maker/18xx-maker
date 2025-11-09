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

  const appleId = process.env.APPLE_ID;
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;

  if (!appleId || !appleTeamId || !applePassword) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appFile = `${appName}.app`;
  const zipFile = `${appName}.zip`;
  const appPath = `${appOutDir}/${appFile}`;
  const zipPath = `${appOutDir}/${zipFile}`;

  console.log(`Creating ${zipFile} from ${appFile}`);
  run(`ditto -c -k --keepParent "${appPath}" "${zipPath}"`);

  console.log(`Submitting ${zipFile} for notarizing`);
  run(
    `xcrun notarytool submit "${zipPath}" --team-id "${appleTeamId}" --apple-id "${appleId}" --password "${applePassword}" --wait`,
  );

  console.log(`Stapling ticket to ${appFile}`);
  run(`xcrun stapler staple "${appPath}"`);
};

export default notarizing;
