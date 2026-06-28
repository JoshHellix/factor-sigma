# Factor

Builder-track submission for **Zama Developer Program — Season 3** (Composable Privacy).

Live app: **https://factor-sigma.vercel.app**

Connect MetaMask on Sepolia, create a confidential invoice, fund it with any official ERC-7984 wrapper, repay, and decrypt the encrypted amounts — without running anything locally.

**Operator guide (step-by-step for demos):** [`docs/FACTOR_OPERATOR_GUIDE.md`](../docs/FACTOR_OPERATOR_GUIDE.md)

Landing page at `/`. The working console is at `/app`.

---

## What this app does

Factor brings **invoice factoring** onchain with FHE. A business (issuer) sells a receivable at a discount for early cash; an investor funds it; the debtor pays back later. The interesting part: **face value, funded amount, and repayment amount are encrypted** (`euint64` on FHEVM). Who owes whom, which token was used, due dates, and invoice status stay public and auditable.

That maps cleanly to Season 3 themes: invoicing, investor distributions, and composable privacy — you can fund invoices with any token from the [Wrappers Registry](https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry), not a hardcoded mock.

---

## Live deployment

| Asset | Sepolia |
|-------|---------|
| **Frontend** | https://factor-sigma.vercel.app |
| **InvoiceFactory** | `0x74Cfb858431c91E2C5006CC0155814794d81e2Ac` |
| **Etherscan** | [View contract](https://sepolia.etherscan.io/address/0x74Cfb858431c91E2C5006CC0155814794d81e2Ac) |

---

## Invoice lifecycle

1. **Create** — issuer sets debtor, due date, funding token (from registry), and encrypts face value via the relayer
2. **Fund** — investor encrypts fund amount; invoice moves to Funded
3. **Repay** — debtor encrypts repayment; invoice moves to Repaid
4. **Inspect & decrypt** — any authorized party runs EIP-712 user-decryption on the encrypted fields they are allowed to see

### Public vs private

| Public on-chain | Encrypted (FHE) |
|-----------------|-----------------|
| Invoice ID, issuer, debtor, investor | Face value |
| Due date, funding token, status | Funded amount |
| | Repaid amount |

---

## Frontend features

- **Create / fund / repay** — relayer encryption through `@zama-fhe/sdk` v3 before each write
- **Wrappers Registry browser** — pick any Sepolia ERC-7984 wrapper as the funding token
- **Shield / unshield panel** — mint test underlying via shared faucet, then wrap before funding
- **Inspect & Decrypt Invoice** — public metadata table + per-field EIP-712 decrypt
- **Activity feed** — recent session transactions with status

---

## Smart contracts

`factor/contracts/InvoiceFactory.sol` — Hardhat + FHEVM.

```bash
cd factor
npm install
npm run compile
npm run test          # FHEVM mock on hardhat network
```

### Deploy to Sepolia

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npm run deploy:sepolia
```

Set the deployed address in `factor/frontend/.env.local`:

```env
NEXT_PUBLIC_INVOICE_FACTORY=0x74Cfb858431c91E2C5006CC0155814794d81e2Ac
```

---

## Run locally

From the monorepo root:

```bash
npm install
npm run dev:factor    # http://localhost:3001
```

Optional env — copy `factor/frontend/.env.example` → `factor/frontend/.env.local`.

---

## Deploy frontend to Vercel

1. Import this repo on [vercel.com/new](https://vercel.com/new)
2. **Root Directory:** `factor/frontend`
3. Install command (in `vercel.json`): `cd ../.. && npm install`
4. Set `NEXT_PUBLIC_INVOICE_FACTORY` and RPC / WalletConnect vars
5. Deploy

---

## Builder-track requirements

| Requirement | Status |
|-------------|--------|
| Smart contract + frontend | `InvoiceFactory.sol` + Next.js app |
| Real-world FHE use case | Confidential invoice factoring |
| Sepolia deployment | Factory live on Sepolia |
| Live demo URL | https://factor-sigma.vercel.app |
| Composable privacy | Any registry ERC-7984 as funding token |
| EIP-712 user decryption | Invoice inspector + SDK flows |
| Documentation | This file |
| Demo video | Recorded (script: [`docs/VIDEO_SCRIPT.md`](../docs/VIDEO_SCRIPT.md)) |
| X thread / article | Publish before deadline |

Submit via [Zama Developer Hub](https://www.zama.org/developer-hub#developer-program) · **Deadline:** July 7, 2026, 23:59 AOE

Form description (copy-paste): [`docs/SUBMISSION_DESCRIPTIONS.md`](../docs/SUBMISSION_DESCRIPTIONS.md)

---

## Tech stack

Solidity 0.8.27 · FHEVM · Hardhat · Next.js 15 · TypeScript · wagmi · viem · `@zama-fhe/sdk` v3 · `@zama-fhe/react-sdk` v3 · shared registry UI in `packages/shared/`

---

## Repo layout

```
factor/
  contracts/   ← InvoiceFactory.sol (deployed on Sepolia)
  frontend/    ← Next.js dApp
packages/shared/   ← registry browser + wrap panel (monorepo root)
```

Smart contracts and frontend live in the **same repository**. Vercel **Root Directory:** `factor/frontend`.

Other Season 3 tracks in the development monorepo are separate submissions.
