# Factor — Operator Guide

Step-by-step instructions for running the full invoice lifecycle on **https://factor-sigma.vercel.app/app**.

Use this before recording your demo video or testing on Sepolia.

**Network:** Sepolia only  
**Factory:** `0x74Cfb858431c91E2C5006CC0155814794d81e2Ac`

---

## The story in one sentence

A business (**issuer**) creates an invoice owed by someone (**debtor**). An **investor** pays early at a discount (encrypted amount). Later the **debtor** repays (encrypted amount). Dollar amounts stay encrypted onchain; who's involved and the status are public.

---

## Before you start

1. **MetaMask on Sepolia** with a little test ETH.
2. **Two wallets** is the easiest setup for a full demo:
   - **Wallet A** — issuer + investor (create and fund)
   - **Wallet B** — debtor (repay only)
3. Copy both addresses somewhere (MetaMask → account → copy).
4. Open **https://factor-sigma.vercel.app/app**

**Note on amounts:** Fields say "USDC" and use **6 decimals** (`1.00` = one dollar in demo terms). The factory stores encrypted `euint64` values — it does **not** pull real ERC-7984 tokens when you fund or repay. The **Wrap** panel shows registry integration; funding does not fail if you skip it.

---

## Page layout

### Top bar

| What you see | Meaning |
|--------------|---------|
| **Factoring console** | Main app |
| Factory `0x74Cf…` | Sepolia contract (if missing, env is misconfigured) |
| **Connect Wallet** | Connect MetaMask |
| **0x… + N invoice(s)** | Your address + total invoices onchain |

### Left column

1. **Create Invoice (Issuer)**
2. **Fund & Repay**
3. **Wrapper Registry** (select funding token)

### Right column

1. **Wrap / Unwrap** (optional)
2. **Inspect & Decrypt Invoice**
3. **Activity** (session log)

---

## Block 1 — Create Invoice (Issuer)

Connect **Wallet A**.

| Field | What to enter |
|-------|----------------|
| **Debtor Address** | Wallet B full `0x…` address |
| **Face Value (USDC)** | e.g. `1.00` |
| **Due in (days)** | e.g. `30` |
| **Selected Funding Token** | Pick from registry first (Block 3) |

Click **Mint Confidential Invoice** → sign in MetaMask → wait for confirmation.

- Toast: "Invoice minted with encrypted face value"
- Invoice count in header increases
- **Note the invoice ID** — first invoice is `0`, second is `1`, etc.

---

## Block 2 — Fund & Repay

### Fund (Wallet A — investor)

| Field | Value |
|-------|-------|
| Invoice ID | `0` (or yours) |
| Fund Amount (USDC) | e.g. `0.80` |

Click **Fund Invoice** → sign → confirm.

- Status: **Open → Funded**
- Your wallet becomes **investor** onchain

### Repay (Wallet B — debtor only)

Switch MetaMask to **Wallet B** → Connect in app.

| Field | Value |
|-------|-------|
| Invoice ID | same as above |
| Repay Amount (USDC) | e.g. `0.85` |

Click **Record Repayment** → sign → confirm.

- Status: **Funded → Repaid**
- If you're on Wallet A, you get **"Only debtor"** — switch wallets

**Status legend:** Open → Funded → Repaid (Cancelled exists on contract but has no UI button)

---

## Block 3 — Wrapper Registry

Before creating an invoice:

1. Expand registry if collapsed
2. Click **Select** on **USDCMock** (or any pair)
3. "Selected Funding Token" in Create Invoice updates

This sets which ERC-7984 token the invoice references onchain.

---

## Block 4 — Wrap / Unwrap (optional)

Active after selecting a registry pair. Use **Shield (Wrap)** only if you want to show confidential token balance in the video. Not required for create/fund/repay to succeed.

---

## Block 5 — Inspect & Decrypt Invoice

1. Enter **Invoice ID** (`0`)
2. Public fields load: Status, Issuer, Debtor, Investor, Funding token, Due date
3. Click **Decrypt face value** / **Decrypt funded amount** / **Decrypt repaid amount**
4. Sign EIP-712 in wallet
5. Green line shows e.g. `faceValue: 1 USDC (6 decimals)`

Connect as a party on the invoice (issuer, investor, or debtor). Decrypt funded amount only after funding; repaid amount only after repay.

---

## Block 6 — Activity

Shows create / fund / repay actions from this browser session with tx hashes.

---

## Full demo path (10 steps)

| Step | Wallet | Where | Action |
|------|--------|-------|--------|
| 1 | A | Top | Connect |
| 2 | A | Registry | Select USDCMock |
| 3 | A | Create | Debtor = B, Face `1.00`, Due `30` |
| 4 | A | Create | **Mint Confidential Invoice** → note ID `0` |
| 5 | A | Inspect | ID `0` → Status **Open** |
| 6 | A | Fund | ID `0`, `0.80` → **Fund Invoice** |
| 7 | A | Inspect | Status **Funded** |
| 8 | B | Top | Switch account → Connect |
| 9 | B | Repay | ID `0`, `0.85` → **Record Repayment** |
| 10 | A or B | Inspect | Status **Repaid** → **Decrypt face value** |

---

## Common mistakes

| Problem | Fix |
|---------|-----|
| Select a funding token | Select pair in registry first |
| Invalid debtor address | Full `0x` address, no spaces |
| Not open / fund fails | Wrong ID or already funded |
| Only debtor | Repay with Wallet B |
| Not funded | Complete fund step first |
| Decrypt fails | Be issuer/investor/debtor; decrypt after that step exists |
| Wrong invoice ID | IDs are `0` … `N-1` (header shows N invoices) |

---

## Public vs private (for the video)

**Public:** invoice ID, issuer, debtor, investor, due date, funding token, status  

**Private:** face value, funded amount, repaid amount  

On Etherscan, amounts are ciphertext handles — decrypt in the app to show real values.

---

## Teleprompter card (short)

```
WALLET A — connect Sepolia
Registry → Select USDCMock
Create: debtor = [B address], face 1.00, due 30 days
Mint Confidential Invoice → ID 0
Fund: ID 0, amount 0.80

WALLET B — switch + connect
Repay: ID 0, amount 0.85

Inspect ID 0 → Decrypt face value → sign EIP-712
Say: amounts encrypted, roles public, composable with Wrappers Registry
```
