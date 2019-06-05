@echo off
SET script_dir=%~dp0

cd %script_dir%/../
start cmd /k tsc -p src/tsconfig.cjs.json -w
start cmd /k tsc -p test/tsconfig.json -w
start cmd /k tsc -p test/tsconfig.cjs.json -w

tsc -p src/tsconfig.json -w