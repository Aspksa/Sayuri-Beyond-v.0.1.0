/**
 * Mock 数据工具函数
 */

/**
 * ID 生成器映射表
 * 为不同的资源类型维护独立的 ID 计数器
 */
const idGenerators = new Map<string, number>()

/**
 * 创建或获取指定资源类型的 ID 生成器
 * @param resourceType 资源类型（如 'product', 'user', 'collection' 等）
 * @param startId 起始 ID，默认为 1
 * @returns 下一个可用的 ID
 */
export function getNextId(resourceType: string, startId = 1): number {
  if (!idGenerators.has(resourceType)) {
    idGenerators.set(resourceType, startId)
  }

  const currentId = idGenerators.get(resourceType)!
  idGenerators.set(resourceType, currentId + 1)
  return currentId
}

/**
 * 重置指定资源类型的 ID 生成器
 * @param resourceType 资源类型
 * @param startId 重置后的起始 ID，默认为 1
 */
export function resetIdGenerator(resourceType: string, startId = 1): void {
  idGenerators.set(resourceType, startId)
}

/**
 * 重置所有资源类型的 ID 生成器
 */
export function resetAllIdGenerators(): void {
  idGenerators.clear()
}

/**
 * 获取指定资源类型的当前 ID（不递增）
 * @param resourceType 资源类型
 * @returns 当前 ID，如果不存在则返回 1
 */
export function getCurrentId(resourceType: string): number {
  return idGenerators.get(resourceType) ?? 1
}
