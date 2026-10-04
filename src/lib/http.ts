interface RequestConfig extends RequestInit {
  params?: Record<string, any>
}

class Http {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string = '', timeout: number = 10000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config

    let fullUrl = this.baseURL + url
    if (params) {
      const query = new URLSearchParams(params).toString()
      fullUrl += `?${query}`
    }

    // 动态导入 store 获取 token
    const { useAuthStore } = await import('@/store')
    const token = useAuthStore.getState().accessToken

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(fullUrl, {
        ...fetchConfig,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...fetchConfig.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

const http = new Http(import.meta.env.VITE_API_BASE_URL)

export default http
