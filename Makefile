MOST_EXPENSIVE_METRICS_RBQL="Select a.name, parseInt(a.indexed_volume)+parseInt(a.ingested_volume) as total_volume, parseInt(a.dashboards) + parseInt(a.notebooks) + parseInt(a.monitors) + parseInt(a.slos) as related_assets order by parseInt(a.indexed_volume)+parseInt(a.ingested_volume) desc"

all: unused-metrics most-expensive-metrics

clean:
	rm output.csv expensive.csv unused.csv

unused-metrics: most-expensive-metrics check-dep
	@echo "Collecting unused metrics..."
	@bunx rbql --with-headers --delim , --input expensive.csv --query "select * order by a.related_assets" --output unused.csv

most-expensive-metrics: output.csv check-dep
	@echo "calculating most expensive metrics..."
	@bunx rbql --with-headers --delim , --input output.csv --query $(MOST_EXPENSIVE_METRICS_RBQL) --output expensive.csv

output.csv: main.js
	@echo "Downloading custom metrics..."
	@bun main.js

check-dep:
	@command -v bun >/dev/null 2>&1 || { echo "bun is not installed. https://bun.sh/docs/installation"; exit 1; }
	@command -v bunx >/dev/null 2>&1 || { echo "bunx is not present. Maybe your bun is old."; exit 1; }