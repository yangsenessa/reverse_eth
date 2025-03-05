>deploytoken.log
#truffle migrate  -f 2 --to 2 --reset --verbose-rpc --network sepolia >deploytoken.log
truffle migrate  Reverse.sol --reset --verbose-rpc --network mainnet >deploytoken.log

git add deploytoken.log
git commit -m "Deploy token"migrate 
git push