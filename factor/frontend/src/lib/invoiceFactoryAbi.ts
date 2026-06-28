export const INVOICE_FACTORY_ABI = [
  {
    type: "function",
    name: "createInvoice",
    inputs: [
      { name: "debtor", type: "address" },
      { name: "fundingToken", type: "address" },
      { name: "dueDate", type: "uint256" },
      { name: "encryptedFaceValue", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [{ name: "invoiceId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fundInvoice",
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "encryptedFundAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordRepayment",
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "encryptedRepayAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getInvoice",
    inputs: [{ name: "invoiceId", type: "uint256" }],
    outputs: [
      { name: "issuer", type: "address" },
      { name: "debtor", type: "address" },
      { name: "fundingToken", type: "address" },
      { name: "investor", type: "address" },
      { name: "dueDate", type: "uint256" },
      { name: "faceValue", type: "bytes32" },
      { name: "fundedAmount", type: "bytes32" },
      { name: "repaidAmount", type: "bytes32" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextInvoiceId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowFaceValueDecrypt",
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "viewer", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowFundedAmountDecrypt",
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "viewer", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowRepaidAmountDecrypt",
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "viewer", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const INVOICE_STATUS = ["Open", "Funded", "Repaid", "Cancelled"] as const;
