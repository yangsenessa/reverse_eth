# reverse_eth
$ npm install -g truffle

$ npm install -g ganache-cli
-a 或 –accounts： 指定启动时要创建的测试账户数量。
-e 或 –defaultBalanceEther： 分配给每个测试账户的ether数量，默认值为100。
-b 或r –blockTime： 指定自动挖矿的blockTime，以秒为单位。默认值为0，表示不进行自动挖矿。
-d 或 –deterministic： 基于预定的助记词（mnemonic）生成固定的测试账户地址。
-n 或 –secure： 默认锁定所有测试账户，有利于进行第三方交易签名。
-m 或 –mnemonic： 用于生成测试账户地址的助记词。
-p 或 –port： 设置监听端口，默认值为8545。
-h 或 –hostname： 设置监听主机，默认值同NodeJS的server.listen()。
-s 或 –seed： 设置生成助记词的种子。.
-g 或 –gasPrice： 设定Gas价格，默认值为20000000000。
-l 或 –gasLimit： 设定Gas上限，默认值为90000。
-f 或 –fork： 从一个运行中的以太坊节点客户端软件的指定区块分叉。输入值应当是该节点旳HTTP地址和端口，例如http://localhost:8545。 可选使用@标记来指定具体区块，例如：http://localhost:8545@1599200。
-i 或 –networkId：指定网络id。默认值为当前时间，或使用所分叉链的网络id。
–db： 设置保存链数据的目录。如果该路径中已经有链数据，ganache-cli将用它初始化链而不是重新创建。
–debug：输出VM操作码，用于调试。
–mem：输出ganache-cli内存使用统计信息，这将替代标准的输出信息。
–noVMErrorsOnRPCResponse：不把失败的交易作为RCP错误发送。开启这个标志使错误报告方式兼容其他的节点客户端，例如geth和Parity。

–account： 指定账户私钥和账户余额来创建初始测试账户。可多次设置：
1
$ ganache-cli --account="<privatekey>,balance" [--account="<privatekey>,balance"]
注意私钥长度为64字符，必须使用0x前缀的16进制字符串。账户余额可以是整数，也可以是0x前缀的17进制字符串，单位为wei。

使用–account选项时，不会自动创建HD钱包。

-u 或 –unlock： 解锁指定账户，或解锁指定序号的账户。可以设置多次。当与–secure选项同时使用时，这个选项将改变指定账户的锁定状态：
1
$ ganache-cli --secure --unlock "0x1234..." --unlock "0xabcd..."
也可以指定一个数字，按序号解锁账号：

1
$ ganache-cli --secure -u 0 -u 1


Implemented Methods
bzz_hive (stub)

bzz_info (stub)

debug_traceTransaction

eth_accounts

eth_blockNumber

eth_call

eth_coinbase

eth_estimateGas

eth_gasPrice

eth_getBalance

eth_getBlockByNumber

eth_getBlockByHash

eth_getBlockTransactionCountByHash

eth_getBlockTransactionCountByNumber

eth_getCode (only supports block number “latest”)

eth_getCompilers

eth_getFilterChanges

eth_getFilterLogs

eth_getLogs

eth_getStorageAt

eth_getTransactionByHash

eth_getTransactionByBlockHashAndIndex

eth_getTransactionByBlockNumberAndIndex

eth_getTransactionCount

eth_getTransactionReceipt

eth_hashrate

eth_mining

eth_newBlockFilter

eth_newFilter (includes log/event filters)

eth_protocolVersion

eth_sendTransaction

eth_sendRawTransaction

eth_sign

eth_syncing

eth_uninstallFilter

net_listening

net_peerCount

net_version

miner_start

miner_stop

personal_listAccounts

personal_lockAccount

personal_newAccount

personal_unlockAccount

personal_sendTransaction

shh_version

rpc_modules

web3_clientVersion

web3_sha3

还有一些特殊的非标准方法不包含在原始RPC规范中：

evm_snapshot :  快照当前块的区块链状态。没有参数。返回创建的快照的整数ID。

evm_revert :  将区块链状态恢复为上一个快照。采用一个参数，即要恢复的快照ID。如果没有传递快照ID，它将恢复到最新的快照。返回true。

evm_increaseTime :  及时向前跳。取一个参数，即以秒为单位增加的时间量。返回总时间调整，以秒为单位。

evm_mine : 强制挖矿。没有参数。开采矿块与是否采矿开始或停止无关。

Unsupported Methods
eth_compileSolidity:  如果你想用Javascript编译Solidity，请参阅solc-js项目。

# initial project
$ mkdir coin-workspace

$ cd coin-workspace

$ truffle unbox xxx

# alchemy fork ETH main net
https://dashboard.alchemy.com/
--ganache-cli --fork  https://eth-mainnet.g.alchemy.com/v2/Br9B6PkCm4u7NhukuwdGihx6SZnhrLWI --port 8545




# truffle init
truffle init
npm init

# Clean previous build artifacts
rm -rf build/

# Compile the contracts
truffle compile

# Deploy with verbose logging
truffle migrate --reset --network development --verbose-rpc
# install openzappelin
-- npm install openzeppelin-solidity@1.12.0

# compile
-- truffle compile


# deploy  truffle migrate --reset --verbose-rpc
-- ganache-cli --gasLimit=80000000
-- truffle migrate --reset --verbose-rpc --network ganache