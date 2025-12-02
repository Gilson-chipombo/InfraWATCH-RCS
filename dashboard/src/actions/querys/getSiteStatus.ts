"use server"

import axios from "axios"

export const getSiteStatus = async ({ httpUrl }: { httpUrl?: string }) => {
  try {
    let httpData = null

    if (httpUrl) {
      try {
        const response = await axios.get(httpUrl)

        // Convert headers to plain object
        const headersPlain = Object.fromEntries(
          Object.entries(response.headers)
        )

        // filtra apenas os campos necessários
        httpData = {
          status: response.status,
          statusText: response.statusText,
          headers: headersPlain, // Convert to plain object
          url: response.config.url,
          method: response.config.method,
        }
      } catch (httpError: any) {
        console.warn("HTTP request failed:", httpError.message || httpError)
      }
    }

    return {
      success: true,
      httpData,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    }
  }
}