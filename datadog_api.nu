def datadog_v2 [path] {
  let base_v2 = "https://api.datadoghq.com/api/v2/"
  let headers = [DD-API-KEY $env.DD_API_KEY DD-APPLICATION-KEY $env.DD_APPLICATION_KEY]
  http get $"($base_v2)($path)" --headers $headers
}

def datadog_v1 [path] {
  let base_v2 = "https://api.datadoghq.com/api/v1/"
  let headers = [DD-API-KEY $env.DD_API_KEY DD-APPLICATION-KEY $env.DD_APPLICATION_KEY]
  http get $"($base_v2)($path)" --headers $headers
}

def list_metrics_v2 [] {
  datadog_v2 /metrics | get data
}

def list_custom_metrics_v2 [] {
  let a = datadog_v2 /metrics?filter[queried]=false | get data | insert queried false
  let b = datadog_v2 /metrics?filter[queried]=true | get data | insert queried true
  $a | append $b | sort-by id | rename --column [id name] | move name queried --before type | drop column 
}

def get_metadata [name] {
  datadog_v1 $"/metrics/($name)"
}

