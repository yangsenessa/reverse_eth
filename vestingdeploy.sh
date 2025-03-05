>vestingdeploy.log
truffle migrate -f 3 --to 3 --reset --verbose-rpc --network ganache >vestingdeploy.log
git add vestingdeploy.log
git commit -m "Deploy vesting"
git push