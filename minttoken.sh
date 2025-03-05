>deploytoken.log
npx truffle migrate --compile-none -f 2 --to 2 --reset --verbose-rpc --network sepolia >deploytoken.log
git add deploytoken.log
git commit -m "Deploy token"
git push