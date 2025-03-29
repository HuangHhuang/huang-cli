import path from 'path';
import { pathToFileURL } from 'url';

export function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep;
    if (sep !== '/') p.replace(/\\/g, '/');
  }

  // 构造绝对路径
  const absolutePath = path.resolve(process.cwd(), p);
  // 转换为 file:// URL（自动处理 Windows/Mac/Linux 差异）
  const moduleUrl = pathToFileURL(absolutePath).href;

  return moduleUrl;
}
