import { exec } from "child_process";
import { existsSync, writeFileSync, chmodSync } from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

// 检查包管理器
exec("npx only-allow pnpm");

// prepare 内容
const HUSKY_HOOK_PRE_COMMIT = ".husky/_/pre-commit";

async function preinstall() {
  try {
    // 检查 Husky pre-commit hook 是否存在
    if (existsSync(HUSKY_HOOK_PRE_COMMIT)) {
    } else {
      await execAsync("npx husky install");
    }

    // 创建 pre-commit hook 文件
    writeFileSync(HUSKY_HOOK_PRE_COMMIT, "npx lint-staged");
    chmodSync(HUSKY_HOOK_PRE_COMMIT, "755");
  } catch (error) {
    console.error("preinstall 执行失败:", error);
    process.exit(1);
  }
}

preinstall();
