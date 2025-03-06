>vestingdeploy.log
npx truffle migrate --compile-non -f 3 --to 3 --reset --verbose-rpc --network mainnet >vestingdeploy.log
git add vestingdeploy.log
git commit -m "Deploy vesting"
git push