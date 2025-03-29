import path from "path";
import { isObject } from "@cookie-cli-dev/utils"
import { packageDirectory } from "pkg-dir"
import { readFileSync } from "fs";
import { formatPath } from "@cookie-cli-dev/format-path";
import npminstall from "npminstall";
import { getDefaultRegistry } from "@cookie-cli-dev/get-npm-info";

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类的options参数不能为空！");
    }
    
    if (!isObject(options)) {
      throw new Error("Package类的options参数必须为对象！");
    }
    // package的路径
    this.targetPath = options.targetPath
    // 存储路径
    this.storeDir = options.storeDir
    // package的名称
    this.packageName = options.packageName
    // package的版本
    this.packageVersion = options.packageVersion
  }

  // 判断当前Package是否存在
  exists() {
  }

  // 安装Package
  install() {    
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  // 更新Package
  update() {
    
  }

  // 获取Package的入口文件路径
  async getRootFilePath() {
    // 1. 获取package.json的路径 
    const dir = await packageDirectory({ cwd: this.targetPath });
    
    if (dir) {
      // 2. 读取package.json
      const packageJsonPath = path.resolve(dir, "package.json");
      
      const pkgFile = await JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      // 3. main/lib
      if (pkgFile && pkgFile.main) {
        // 4. 路径的兼容（macOS/windows）
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }
}

export default Package;