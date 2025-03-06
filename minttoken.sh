>deploytoken.log
truffle compile --all
npx truffle migrate --compile-non  -f 2 --to 2 --reset --verbose-rpc --network mainnet >deploytoken.log

git add deploytoken.log
git commit -m "Deploy token"migrate 
git push