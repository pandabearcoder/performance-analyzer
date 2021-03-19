#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

rm -f results/index.html

for filename in scripts/*.js; do
    [ -e "${filename}" ] || continue
    node "${filename}"
done

cd results

tree -H '.' -L 1 --noreport --charset utf-8 -P "*.html" > index.html
