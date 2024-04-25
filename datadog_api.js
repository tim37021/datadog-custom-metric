import { pRateLimit } from "p-ratelimit"

const API_V1 = "https://api.datadoghq.com/api/v1"
const API_V2 = "https://api.datadoghq.com/api/v2"

const DD_API_KEY = process.env.DD_API_KEY
const DD_APPLICATION_KEY = process.env.DD_APPLICATION_KEY

const common_headers = {
    "DD-API-KEY": DD_API_KEY,
    "DD-APPLICATION-KEY": DD_APPLICATION_KEY,
}

const ddoglimit = pRateLimit({
    interval: 1000,
    rate: 30,
    concurrency: 10,
})

const ddog_fetch = (async (...args) => {
    return await ddoglimit(() => fetch(...args))
})

export async function list_metrics(arg) {
    const response = await ddog_fetch(
        `${API_V1}/metrics?${new URLSearchParams(arg).toString()}`,
        {
            headers: common_headers
        }
    )

    const data = await response.json();
    return data.metrics
}

export async function list_metrics2(arg) {
    const params = {}
    Object.entries(arg.filter ?? {}).forEach(([k, v]) => {
        params[`filter[${k}]`] = `${v}`
    })
    Object.entries(arg.window ?? {}).forEach(([k, v]) => {
        params[`window[${k}]`] = `${v}`
    })
    const response = await ddog_fetch(
        `${API_V2}/metrics?${new URLSearchParams(params).toString()}`,
        {
            headers: common_headers
        }
    )

    const data = await response.json();
    return data.data.map((v) => v.id)
}

export async function list_distinct_volume(name) {
    const response = await ddog_fetch(
        `${API_V2}/metrics/${name}/volumes`,
        {
            headers: common_headers
        }
    )

    const data = await response.json();
    return data.data
}

export async function related_assets(name) {
    const response = await ddog_fetch(
        `${API_V2}/metrics/${name}/assets`,
        {
            headers: common_headers
        }
    )

    const data = await response.json()
    return data.data
}

export async function metadata(name) {
    const response = await ddog_fetch(
        `${API_V1}/metrics/${name}`,
        {
            headers: common_headers
        }
    )

    const data = await response.json()
    return data
}