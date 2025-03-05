>deploytoken.log
truffle migrate -f 2 --to 2 --reset --verbose-rpc --network ganache >deploytoken.log
git add deploytoken.log
git commit -m "Deploy token"
git push