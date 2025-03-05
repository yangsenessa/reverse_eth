>presaledeploy.log
truffle migrate -f 4 --to 4 --reset --verbose-rpc --network ganache >presaledeploy.log
git add presaledeploy.log
git commit -m "Deploy presale contract"
git push