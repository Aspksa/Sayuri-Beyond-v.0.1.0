/**
 * 将字符串环境变量转换为布尔值
 * @param value 读取到的环境变量
 * @param defaultValue 默认值（当 value 为空或无法解析时返回）
 */
export function env2boolean(
  value: string | undefined,
  defaultValue: boolean = import.meta.env.DEV,
): boolean {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') {
      return true
    }
    if (normalized === 'false') {
      return false
    }
  }

  return defaultValue
}
