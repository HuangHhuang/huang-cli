
export default function init(projectName, options, cmdObj) {
  console.log("init", projectName, cmdObj.opts().force, process.env.CLI_TARGET_PATH);
}
 