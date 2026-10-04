import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 重试次数
      retry: 1,
      // 数据立即变为 stale
      // 数据被认为过时后的时间 (以毫秒为单位)。 如果设置为: Infinity,数据永远不会被认为是过时的。
      // 如果设置为函数，则该函数将与查询一起执行，以计算staleTime。 默认为 0。
      staleTime: 10 * 60 * 1000, // 10 minute,
      // 缓存 1 秒，避免同时多次请求
      // 未使用/非活动缓存数据保留在内存中的时间 (以毫秒为单位)。
      // 当查询的缓存变为未使用或非活动状态时，该缓存数据将在此持续时间之后被垃圾收集。
      // 当指定不同的垃圾收集时间时，将使用最长的一个。 将其设置为Infinity将禁用垃圾回收。
      gcTime: 60 * 1000, // 1 minute,
      //  'always'：总是发起网络请求，即使在离线状态
      // 'online'（默认）：只在在线状态发起请求
      // 'offlineFirst'：优先使用缓存，在线时才更新
      networkMode: 'always',
      // 聚焦窗口时重新获取数据
      refetchOnWindowFocus: false,
    },
  },
})
