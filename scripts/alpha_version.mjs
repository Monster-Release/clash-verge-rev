import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

/**
 *  为Alpha版本重命名版本号
 */
const execPromise = promisify(exec);

/**
 * 标准输出HEAD hash
 */
async function getLatestCommitHash() {
  try {
    const { stdout } = await execPromise("git rev-parse HEAD");
    const commitHash = stdout.trim();
    // 格式化，只截取前7位字符
    const formathash = commitHash.substring(0, 7);
    console.log(`Found the latest commit hash code: ${commitHash}`);
    return formathash;
  } catch (error) {
    console.error("pnpm run fix-alpha-version ERROR", error);
  }
}

/**
 * @param string 传入格式化后的hash
 * 将新的版本号写入文件 package.json / tauri.conf.json
 */
async function updatePackageVersion(newVersion) {
  // 获取内容根目录
  const _dirname = process.cwd();
  const packageJsonPath = path.join(_dirname, "package.json");
  const tauriDir = path.join(_dirname, "src-tauri");
  const internalfile = path.join(tauriDir, "tauri.conf.json");
  try {
    const data = await fs.readFile(packageJsonPath, "utf8");
    const tauriData = await fs.readFile(internalfile, "utf8");

    const packageJson = JSON.parse(data);
    const tauriJson = JSON.parse(tauriData);

    let result = packageJson.version.replace("alpha", newVersion);
    console.log("[INFO]: Current version is: ", result);
    packageJson.version = result;
    tauriJson.version = result;
    // 写入版本号
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8",
    );
    await fs.writeFile(
      internalfile,
      JSON.stringify(tauriJson, null, 2),
      "utf8",
    );
    console.log(`[INFO]: Alpha version update to: ${newVersion}`);
  } catch (error) {
    console.error("pnpm run fix-alpha-version ERROR", error);
  }
}

const newVersion = await getLatestCommitHash();
updatePackageVersion(newVersion).catch(console.error);
