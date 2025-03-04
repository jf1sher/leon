import dns from 'node:dns'

import type { AxiosInstance } from 'axios'
import axios from 'axios'

interface NetworkOptions {
  /** `baseURL` will be prepended to `url`. It can be convenient to set `baseURL` for an instance of `Network` to pass relative URLs. */
  baseURL?: string
}

interface NetworkRequestOptions {
  /** Server URL that will be used for the request. */
  url: string

  /** Request method to be used when making the request. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  /** Data to be sent as the request body. */
  data?: Record<string, unknown>

  /** Custom headers to be sent. */
  headers?: Record<string, string>
}

interface NetworkResponse<ResponseData> {
  /** Data provided by the server. */
  data: ResponseData

  /** HTTP status code from the server response. */
  statusCode: number

  /** Options that was provided for the request. */
  options: NetworkRequestOptions & NetworkOptions
}

export class NetworkError<ResponseErrorData = unknown> extends Error {
  public readonly response: NetworkResponse<ResponseErrorData>

  public constructor(response: NetworkResponse<ResponseErrorData>) {
    super(`[NetworkError]: ${response.statusCode}`)
    this.response = response
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

export class Network {
  private readonly options: NetworkOptions
  private axios: AxiosInstance

  public constructor(options: NetworkOptions = {}) {
    this.options = options
    this.axios = axios.create({
      baseURL: this.options.baseURL
    })
  }

  /**
   * Send HTTP request
   * @param options Request options
   * @example request({ url: '/send', method: 'POST', data: { message: 'Hi' } })
   */
  public async request<ResponseData = unknown, ResponseErrorData = unknown>(
    options: NetworkRequestOptions
  ): Promise<NetworkResponse<ResponseData>> {
    try {
      const response = await this.axios.request<ResponseData>({
        url: options.url,
        method: options.method.toLowerCase(),
        data: options.data,
        headers: options.headers
      })
      return {
        data: response.data,
        statusCode: response.status,
        options: {
          ...this.options,
          ...options
        }
      }
    } catch (error) {
      let statusCode = 500
      let data = {} as ResponseErrorData
      if (axios.isAxiosError(error)) {
        data = error?.response?.data
        statusCode = error?.response?.status ?? 500
      }
      throw new NetworkError<ResponseErrorData>({
        data,
        statusCode,
        options: {
          ...this.options,
          ...options
        }
      })
    }
  }

  /**
   * Check if error is a network error
   * @param error Error to check
   * @example isNetworkError(error) // false
   */
  public isNetworkError<ResponseErrorData = unknown>(
    error: unknown
  ): error is NetworkError<ResponseErrorData> {
    return error instanceof NetworkError
  }

  /**
   * Verify whether there is an Internet connectivity
   * @example isNetworkAvailable() // true
   */
  public async isNetworkAvailable(): Promise<boolean> {
    try {
      await dns.promises.resolve('getleon.ai')

      return true
    } catch {
      return false
    }
  }
}
