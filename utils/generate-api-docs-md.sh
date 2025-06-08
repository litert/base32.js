#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

cd $SCRIPT_ROOT/..

API_DOC_OUTPUT_DIR=docs/en-us/api
SRC_DIR=src/lib

rm -rf $API_DOC_OUTPUT_DIR

npx typedoc \
    --exclude "**/*+(index|.test).ts" \
    --out api \
    --readme none \
    --name "Documents for @litert/base32" \
    --plugin typedoc-plugin-markdown \
    --plugin typedoc-vitepress-theme \
    --sourceLinkTemplate "https://github.com/litert/base32.js/blob/master/{path}#L{line}" \
    $SRC_DIR/base32-js.ts \
    $SRC_DIR/base32-wasm.ts

mv api $API_DOC_OUTPUT_DIR
