"use client";

/**
 * EIP-712 user-decryption flow for ERC-7984 balances.
 * Wraps Zama SDK `createReadonlyToken().balanceOf()` which handles session signing internally.
 */
export { useConfidentialBalance as useUserDecrypt } from "./useConfidentialBalance";
