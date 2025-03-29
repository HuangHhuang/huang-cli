"use strict";

import path from "path";
import semver from "semver";
import picocolors from "picocolors";
import os from "os";
import pathExists from "path-exists";
import log from "@cookie-cli-dev/log";
import constant from "./const.js";
import dotenv from "dotenv";
import { getNpmSemverVersion } from "@cookie-cli-dev/get-npm-info";
import { rootCheck } from "teal-node-utils";
import { Command } from "commander";
import exec from "@cookie-cli-dev/exec"

import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取当前文件的绝对目录
const currentDir = __dirname;
// 定位到上一级目录的 package.json
const packageJsonPath = path.resolve(currentDir, "../package.json");
// 读取文件
const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// 获取用户主目录
const userHome = os.homedir();

// 实例化脚手架对象
const program = new Command();

async function core() {
  try {
    prepare();
    registerCommand();
  } catch (e) {
    log.error(e.message);
    if (program.opts().debug) {
      console.log(e);
    }
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("--targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec)

  program.on('option:debug', () => {
    if (program.opts().debug) {
      // 开启 debug 模式
      process.env.LOG_LEVEL = 'verbose'
    } else {
      // 关闭 debug 模式
      process.env.LOG_LEVEL ='info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = program.opts().targetPath
  })

  // 对于未知命令的处理
  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(picocolors.red('未知的命令' + obj[0]));
    if (availableCommands.length > 0) {
      console.log(picocolors.red('可用命令:' + availableCommands.join(',')))
    }
  })
  
  program.parse(process.argv);

  // 没有命令时输出帮助信息
  if (process.argv && process.argv.length < 1) {
    program.outputHelp();
    console.log('');
  }

}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

function checkEnv() {
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
}

async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 4. 获取最新的版本号，提示更新到该版本

  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      picocolors.yellow(
        `请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${lastVersion}
        更新命令: npm install -g ${npmName}`
      )
    );
  }
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };

  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(picocolors.red("当前登录用户主目录不存在"));
  }
}

function checkRoot() {
  rootCheck();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(
      picocolors.red(
        `cookie-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`
      )
    );
  }
}

function checkPkgVersion() {
  log.info("cli", pkg.version);
}

export default core;
