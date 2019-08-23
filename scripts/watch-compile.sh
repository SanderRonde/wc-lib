#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

TERM=$TERMINAL
if [ -z $TERM ]; then
	TERM="terminal"
fi

cd $script_path/../
$TERM -e "bash -c \"tsc -p src/tsconfig.cjs.json -w\""
$TERM -e "bash -c \"tsc -p test/tsconfig.json -w -w\""
$TERM -e "bash -c \"tsc -p test/tsconfig.cjs.json -w -w\""
tsc -p src/tsconfig.json -w