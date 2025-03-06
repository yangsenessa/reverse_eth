>presaledeploy.log
npx truffle migrate  --compile-non -f 4 --to 4 --reset --verbose-rpc --network mainnet >presaledeploy.log
git add presaledeploy.log
git commit -m "Deploy presale contract"
git push