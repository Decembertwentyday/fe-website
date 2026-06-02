/**
 * ============================================================
 * 文件说明：智能合约 ABI（Application Binary Interface）定义文件
 *
 * 什么是 ABI？
 * ABI 是"合约接口说明书"——就像 API 文档一样，告诉前端：
 *   - 这个合约有哪些函数可以调用
 *   - 每个函数需要什么参数、返回什么值
 *   - 会触发哪些事件（Event）
 *   - 有哪些自定义错误（Error）
 *
 * 前端通过 ABI + 合约地址，就能与链上合约交互，无需了解合约内部实现。
 *
 * 本文件包含 6 个合约的 ABI：
 * ─────────────────────────────────────────────────────────
 * 1. EtchMarketABI          主市场合约（单个 NFT 挂单/购买/取消）
 * 2. EtchMarketSweepABI     扫货合约（批量购买多个 NFT）
 * 3. EtchLaunchpadABI       Launchpad 合约（新项目发行/认购）
 * 4. EtchMarketVaultABI     金库合约（NFT 托管存取）
 * 5. ERC20SFactoryABI       ERC20 铭文工厂合约（发行铭文代币）
 * 6. ERC20EthscriptionsABI  ERC20 铭文代币合约（铭文代币转账等）
 * ─────────────────────────────────────────────────────────
 *
 * 如何使用这些 ABI？
 * 通常配合 ethers.js 使用：
 *   const contract = new ethers.Contract(合约地址, EtchMarketABI, signer);
 *   await contract.executeEthscriptionOrder(order, recipient, '0x');
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────────────
// 合约 1：EtchMarketABI — 主市场合约
//
// 功能：处理单个 NFT（以太坊铭文）的上架、购买、取消挂单
//
// 核心函数：
//   executeEthscriptionOrder  →  购买一个铭文（需要支付 ETH）
//   executeOrderWithMerkle    →  使用批量订单+Merkle证明购买
//   cancelAllOrders           →  取消该用户的所有挂单
//   cancelMultipleMakerOrders →  取消指定 nonce 的挂单
//   withdrawEthscription      →  从合约取出自己托管的铭文
//
// 核心事件：
//   EthscriptionDeposited       →  铭文已存入合约（上架时触发）
//   EthscriptionOrderExecuted   →  订单已成交（购买成功时触发）
//   EthscriptionWithdrawn       →  铭文已提取（撤销上架时触发）
//   CancelAllOrders             →  用户批量取消所有订单
//
// 核心错误（Solidity 自定义错误，比 revert string 省 Gas）：
//   SignatureInvalid    →  订单签名无效（可能是伪造的）
//   OrderExpired        →  订单已过期（endTime 已过）
//   MsgValueInvalid     →  支付金额不对
//   EthscriptionInvalid →  铭文不存在或不合法
// ─────────────────────────────────────────────────────────────────────
export const EtchMarketABI = [
  {
    // ↓ 自定义错误：货币（支付方式）不合法，只允许 ETH 或白名单 ERC20
    inputs: [],
    name: 'CurrencyInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ETHTransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyOrderCancelList',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EthscriptionInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExpiredSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientConfirmations',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MerkleProofInvalid',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'MerkleProofTooLarge',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MsgValueInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoncesInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OrderExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OrderNonceTooLow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RecipientInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SignatureInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SignerInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TrustedSignatureInvalid',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMinNonce',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'CancelAllOrders',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'orderNonces',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'CancelMultipleOrders',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'EIP712DomainChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'EthscriptionDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'orderHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderNonce',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'currency',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'endTime',
        type: 'uint64',
      },
    ],
    name: 'EthscriptionOrderExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'EthscriptionWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint96',
        name: 'creatorFeeBps',
        type: 'uint96',
      },
    ],
    name: 'NewCreatorFeeBps',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'currencyManager',
        type: 'address',
      },
    ],
    name: 'NewCurrencyManager',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint96',
        name: 'protocolFeeBps',
        type: 'uint96',
      },
    ],
    name: 'NewProtocolFeeBps',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'protocolFeeRecipient',
        type: 'address',
      },
    ],
    name: 'NewProtocolFeeRecipient',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'trustedVerifier',
        type: 'address',
      },
    ],
    name: 'NewTrustedVerifier',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TransferEthscriptionForPreviousOwner',
    type: 'event',
  },
  {
    stateMutability: 'nonpayable',
    type: 'fallback',
  },
  {
    inputs: [],
    name: 'cancelAllOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'orderNonces',
        type: 'uint256[]',
      },
    ],
    name: 'cancelMultipleMakerOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'creatorFeeBps',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currencyManager',
    outputs: [
      {
        internalType: 'contract ICurrencyManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'ethscriptionId',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'quantity',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'currency',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'startTime',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'endTime',
            type: 'uint64',
          },
          {
            internalType: 'uint16',
            name: 'protocolFeeDiscounted',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'creatorFee',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'params',
            type: 'bytes',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct OrderTypes.EthscriptionOrder',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'executeEthscriptionOrder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
          {
            internalType: 'bytes32[]',
            name: 'ethscriptionIds',
            type: 'bytes32[]',
          },
          {
            internalType: 'uint256[]',
            name: 'quantities',
            type: 'uint256[]',
          },
          {
            internalType: 'address',
            name: 'currency',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'startTime',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'endTime',
            type: 'uint64',
          },
          {
            internalType: 'uint16',
            name: 'protocolFeeDiscounted',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'creatorFee',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'params',
            type: 'bytes',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct BatchOrder.EthscriptionOrder',
        name: 'order',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'value',
                type: 'bytes32',
              },
              {
                internalType: 'enum BatchOrder.MerkleTreeNodePosition',
                name: 'position',
                type: 'uint8',
              },
            ],
            internalType: 'struct BatchOrder.MerkleTreeNode[]',
            name: 'proof',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct BatchOrder.MerkleTree',
        name: 'merkleTree',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'executeOrderWithMerkle',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'proofLength',
        type: 'uint256',
      },
    ],
    name: 'hashBatchOrder',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'batchOrderHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'orderNonce',
        type: 'uint256',
      },
    ],
    name: 'isUserOrderNonceExecutedOrCancelled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFeeBps',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFeeRecipient',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_trustedVerifier',
        type: 'address',
      },
    ],
    name: 'updateTrustedVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userMinOrderNonce',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        internalType: 'uint64',
        name: 'expiration',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: 'trustedSign',
        type: 'bytes',
      },
    ],
    name: 'withdrawEthscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'ethscriptionIds',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint64',
        name: 'expiration',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: 'trustedSign',
        type: 'bytes',
      },
    ],
    name: 'withdrawMultipleEthscriptions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawUnexpectedERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────
// 合约 2：EtchMarketSweepABI — 扫货（批量购买）合约
//
// 功能：允许用户一次性批量购买多个铭文 NFT（"扫货"功能）
//
// 为什么需要单独的扫货合约？
//   EtchMarketABI 每次只能处理一个订单，多笔购买需要多次交易（多次 Gas）
//   EtchMarketSweepABI 把多个订单打包成一笔交易，省 Gas 且体验更好
//
// 核心函数：
//   sweepCollection  →  批量购买同一集合的多个铭文（购物车结算）
//
// 购物车流程：
//   用户把多个铭文加入购物车 → CartStore 记录 orderIds
//   → 点"结算" → 调用 sweepCollection → 一笔交易完成所有购买
// ─────────────────────────────────────────────────────────────────────
export const EtchMarketSweepABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'ethscriptionId',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'quantity',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'currency',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'startTime',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'endTime',
            type: 'uint64',
          },
          {
            internalType: 'uint16',
            name: 'protocolFeeDiscounted',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'creatorFee',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'params',
            type: 'bytes',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct OrderTypes.EthscriptionOrder[]',
        name: 'orders',
        type: 'tuple[]',
      },
    ],
    name: 'batchBuy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
          {
            internalType: 'bytes32[]',
            name: 'ethscriptionIds',
            type: 'bytes32[]',
          },
          {
            internalType: 'uint256[]',
            name: 'quantities',
            type: 'uint256[]',
          },
          {
            internalType: 'address',
            name: 'currency',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'startTime',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'endTime',
            type: 'uint64',
          },
          {
            internalType: 'uint16',
            name: 'protocolFeeDiscounted',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'creatorFee',
            type: 'uint16',
          },
          {
            internalType: 'bytes',
            name: 'params',
            type: 'bytes',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct BatchOrder.EthscriptionOrder[]',
        name: 'orders',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'value',
                type: 'bytes32',
              },
              {
                internalType: 'enum BatchOrder.MerkleTreeNodePosition',
                name: 'position',
                type: 'uint8',
              },
            ],
            internalType: 'struct BatchOrder.MerkleTreeNode[]',
            name: 'proof',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct BatchOrder.MerkleTree[]',
        name: 'merkleTrees',
        type: 'tuple[]',
      },
    ],
    name: 'bulkBuy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'setMarketAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────
// 合约 3：EtchLaunchpadABI — Launchpad（发射台）合约
//
// 功能：新铭文项目的首发认购
// 类比：就像股票的 IPO、代币的 IDO，项目方通过 Launchpad 以固定价格
//       向用户出售新铭文，用户认购后获得对应的铭文
//
// 核心函数：
//   mint         →  用户认购（花 ETH 购买新铭文）
//   setMintPrice →  项目方设置认购价格（仅管理员）
//   withdraw     →  项目方提取认购收益
//
// OG Pass 相关：
//   持有 OG Pass 的用户可能享有优先认购权或折扣价
//   GlobalStore.isOgPass 记录当前用户是否有 OG Pass 资格
// ─────────────────────────────────────────────────────────────────────
export const EtchLaunchpadABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'rootHash',
        type: 'bytes32',
      },
    ],
    name: 'MerkleRootHashUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'mintLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'MintInfoUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'MaxAvailable',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'current_index',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'merkleRootHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicMaxMintPerAddress',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'num',
        type: 'uint256',
      },
    ],
    name: 'publicMint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicMintPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicMintStartAfter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'publicMinted',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'recipient',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'rootHash',
        type: 'bytes32',
      },
    ],
    name: 'setMerkleRootHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_publicMintStartAfter',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_publicMaxMintPerAddress',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_publicMintPrice',
        type: 'uint256',
      },
    ],
    name: 'setPublicMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'setRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_whitelistMintStartAfter',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_whitelistMaxMintPerAddress',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_whitelistMintPrice',
        type: 'uint256',
      },
    ],
    name: 'setWhitelistMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'whitelistMaxMintPerAddress',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'num',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]',
      },
    ],
    name: 'whitelistMint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'whitelistMintPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'whitelistMintStartAfter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'whitelistMinted',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────
// 合约 4：EtchMarketVaultABI — 金库（Vault）合约
//
// 功能：铭文 NFT 的托管仓库
// 原理：当卖家挂单出售时，铭文被存入这个合约（托管）
//       买家付款后，合约自动把铭文转给买家，把 ETH 转给卖家
//       整个过程无需信任对方，合约自动执行（这就是"去中心化"的意义）
//
// 核心函数：
//   deposit          →  存入铭文（上架时调用）
//   withdraw         →  取出铭文（撤销上架时调用）
//   transferEthscription  →  合约内部转移铭文所有权（成交时调用）
//
// 为什么需要 Vault？
//   铭文的所有权转移需要在以太坊协议层完成（通过特殊的转账交易）
//   合约先接管铭文，确保买家付款后才执行转移，防止卖家跑路
// ─────────────────────────────────────────────────────────────────────
export const EtchMarketVaultABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'EIP712DomainChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'orderId',
        type: 'bytes32',
      },
    ],
    name: 'EthscriptionWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'trustedVerifier',
        type: 'address',
      },
    ],
    name: 'NewTrustedVerifier',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'redeemer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TokenEthscriptionRedeemed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'staker',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TokenEthscriptionStaked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TransferEthscription',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TransferEthscriptionForPreviousOwner',
    type: 'event',
  },
  {
    stateMutability: 'nonpayable',
    type: 'fallback',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
    ],
    name: 'redeem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_trustedVerifier',
        type: 'address',
      },
    ],
    name: 'updateTrustedVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'orderId',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'withdrawerSign',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'trustedSign',
        type: 'bytes',
      },
    ],
    name: 'withdrawEthscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'withdrawRecords',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────
// 合约 5：ERC20SFactoryABI — ERC20 铭文代币工厂合约
//
// 功能：用于部署（创建）新的铭文代币合约
// 类比：工厂合约 = 代币发射器，每次调用 deploy() 就会产生一个新的代币合约
//
// 核心函数：
//   deploy   →  创建一个新的铭文 ERC20 代币（项目方调用）
//   getToken →  根据代币名称查询已部署的合约地址
//
// 为什么用工厂模式？
//   不同的铭文代币项目方不需要自己写合约，统一通过工厂创建
//   节省 Gas，统一标准，方便前端统一接入
// ─────────────────────────────────────────────────────────────────────
export const ERC20SFactoryABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'totalSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limitPerMint',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'walletLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: 'inscribeStartTime',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'inscribeBlockInterval',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'royaltyReceiver',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'royaltyFraction',
        type: 'uint96',
      },
      {
        internalType: 'address',
        name: 'controller',
        type: 'address',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethscriptionNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// ─────────────────────────────────────────────────────────────────────
// 合约 6：ERC20EthscriptionsABI — ERC20 铭文代币合约
//
// 功能：铭文版的 ERC20 代币接口（每个铭文代币项目对应一个此类合约）
//
// 什么是铭文 ERC20？
//   传统 ERC20：写在合约 storage 里的数字账本
//   铭文 ERC20：通过特殊格式的以太坊交易（calldata）来记录转账
//              利用 Ethscription 协议来模拟代币行为
//
// 核心函数（与标准 ERC20 相同的接口）：
//   balanceOf   →  查询某地址的代币余额
//   transfer    →  转账给其他地址
//   approve     →  授权第三方合约操作代币
//   allowance   →  查询授权额度
//   totalSupply →  总供应量
//   decimals    →  精度（通常是 18，即 1 个代币 = 10^18 最小单位）
// ─────────────────────────────────────────────────────────────────────
export const ERC20EthscriptionsABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'totalSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limitPerMint',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'walletLimit_',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: 'inscribeStartTime_',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'inscribeBlockInterval_',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'royaltyReceiver_',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'royaltyFraction_',
        type: 'uint96',
      },
      {
        internalType: 'address',
        name: 'controller_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ERC20SExceedEthscriptionSupply',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
    ],
    name: 'ERC20SInvalidPreviousOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ERC20SNonexistentEthscription',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC20SSplitAmountTooSmall',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousController',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newController',
        type: 'address',
      },
    ],
    name: 'ControllerTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'walletLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'inscribeStartTime',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'inscribeBlockInterval',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'royaltyReceiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'royaltyFraction',
        type: 'uint96',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'controller',
        type: 'address',
      },
    ],
    name: 'ERC20SV1Deployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'initialOwner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'contentURI',
        type: 'string',
      },
    ],
    name: 'ethscriptions_protocol_CreateEthscription',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'depositor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'ids',
        type: 'bytes32[]',
      },
    ],
    name: 'ethscriptions_protocol_DepositForEthscriptions',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'depositor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'ids',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ethscriptions_protocol_DepositForTransferEthscriptions',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ethscriptions_protocol_TransferEthscriptionForPreviousOwner',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'controller',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'ethscriptionIds',
        type: 'bytes32[]',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'ethscriptionIds',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'depositTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'ethscriptionId',
        type: 'bytes32',
      },
    ],
    name: 'depositorOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethscriptionIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethscriptionSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'inscribe',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'inscribeBlockInterval',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'inscribeCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'inscribeStartTime',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastInscribeBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'limitPerMint',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'split',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newController',
        type: 'address',
      },
    ],
    name: 'transferController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'walletLimit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'ethscriptionIds',
        type: 'bytes32[]',
      },
    ],
    name: 'withdrawEthscriptions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
