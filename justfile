set shell := ["bash", "-uec"]

default:
    @just --list

test:
    time pnpm run astound
    easilydig append data/*.json
    easilydig fetch >/tmp/fastplay.json
    cat /tmp/fastplay.json | jq length
    cat /tmp/fastplay.json | jq -r '. | sort_by(.scrapedAt) | to_entries[] | [.key+1, .value.amount, .value.amountUnits, .value.scrapedAt] | "\(.[0]) \(.[1])\(.[2]) \(.[3])"'
    americansouth /tmp/fastplay.json
