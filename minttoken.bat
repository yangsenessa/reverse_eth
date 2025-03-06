@echo off
REM filepath: d:\project\reverse_eth\minttoken.bat
echo. > deploytoken.log
call truffle compile --all
call npx truffle migrate --compile-non -f 2 --to 2 --reset --verbose-rpc --network sepolia > deploytoken.log

git add deploytoken.log
git commit -m "Deploy token"
git push