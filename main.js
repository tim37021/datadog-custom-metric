import fs from "fs"
import { pRateLimit } from "p-ratelimit"
import cliProgress from "cli-progress"

import { list_metrics2, list_distinct_volume, metadata, related_assets } from "./datadog_api"

const tasklimit = pRateLimit({
    interval: 1000,
    rate: 100,
    concurrency: 10,
})

async function output_csv() {
    // create a new progress bar instance and use shades_classic theme
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let idx = 0
    let custom_metrics = await list_metrics2({ filter: { queried: true }, window: { seconds: 3600 * 24 * 30 } })
    custom_metrics = custom_metrics.concat(await list_metrics2({ filter: { queried: false } , window: { seconds: 3600 * 24 * 30 } }))
    const list_distinct_volume_with_progress = async (v) => {
        const ret = await list_distinct_volume(v)
        if (ret.type == "distinct_metric_volumes") {
            ret.attributes.indexed_volume = ret.attributes.distinct_volume
            ret.attributes.ingested_volume = 0
        }
        const meta = await metadata(v)
        const assets = await related_assets(v)
        bar1.update(++idx)
        const relationships = assets.relationships
        const asset_counts = { dashboards: relationships.dashboards.data.length, monitors: relationships.monitors.data.length, notebooks: relationships.notebooks.data.length, slos: relationships.slos.data.length }
        fs.appendFileSync("output.csv", `${v},${meta.integration ?? ""},${ret.attributes.indexed_volume},${ret.attributes.ingested_volume},${asset_counts.dashboards},${asset_counts.notebooks},${asset_counts.monitors},${asset_counts.slos},"${meta.description}"\n`)
    }
    bar1.start(custom_metrics.length, 0)
    fs.writeFileSync("output.csv", "name,integration,indexed_volume,ingested_volume,dashboards,notebooks,monitors,slos,description\n")
    await Promise.all(custom_metrics.map((v) => tasklimit(() => list_distinct_volume_with_progress(v))))
    bar1.stop()
}

async function main() {
    // console.dir(await related_assets("fazz.app.avail"), {depth: null})
    await output_csv()
}

main();
