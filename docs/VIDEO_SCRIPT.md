# Factor — 3-Minute Builder Video Pitch (Updated)

**Track:** Builder · up to **7,000 cUSDT** (5 winners)  
**Target length:** **2:50 – 3:10** (hard stop at 3:15)  
**Live demo:** https://factor-sigma.vercel.app  
**App URL:** https://factor-sigma.vercel.app/app  
**InvoiceFactory (Sepolia):** `0x74Cfb858431c91E2C5006CC0155814794d81e2Ac`

---

## Timing guide

| Rule | Value |
|------|--------|
| Speaking pace | **125–130 words/minute** |
| Max spoken words (with demos) | **~340** |
| This script spoken total | **~315 words** |
| Silent demo time | **~65 seconds** |

**SAY** = narration · **DO** = screen action (often **silent** during wallet txs)

---

## Before you record

- [ ] MetaMask **Sepolia**, test ETH  
- [ ] **Three roles** ready: **Issuer**, **Investor**, **Debtor** (three wallets — or narrate when reusing one)  
- [ ] Investor wallet has **confidential USDC** (wrap via registry in app first)  
- [ ] 1080p capture · rehearse full path once  
- [ ] Label on-screen: `Issuer` / `Investor` / `Debtor` when switching

---

## FULL SCRIPT

### [0:00 – 0:20] HOOK — landing (~50 words)

**DO:** **https://factor-sigma.vercel.app** — hero video, headline *“Finance invoices without broadcasting your numbers.”*

**SAY:**

> Hi, I'm **[your name]**. This is **Factor** — confidential **invoice factoring** on Zama FHEVM. **[Builder track, Season 3.]**
>
> Public chains are great for settlement, terrible for **privacy**. Put receivables on-chain in plaintext and everyone sees your book. **Factor encrypts every dollar amount.**

**[44 words]**

**DO:** Click **Open Factoring App** (header or hero CTA).

---

### [0:20 – 0:40] PROBLEM — landing scroll (~55 words)

**DO:** Scroll **Invoice lifecycle** section (Issue → Fund → Repay). Don't read every card — glance.

**SAY:**

> Real use case: **Acme** is owed a hundred thousand dollars, due in sixty days. An **investor** pays eighty thousand **today** at a discount. When the debtor pays, the investor earns the spread.
>
> On-chain, that works — but amounts must stay **secret**. Face value, funding, and repayment are **`euint64`** ciphertexts.

**[52 words]**

**DO:** Click through to **/app** if not already there.

---

### [0:40 – 0:52] THREE ROLES (~35 words)

**DO:** App bar shows **Factoring console** + factory address. Point at **Create** / **Fund & Repay** columns.

**SAY:**

> Three roles: **Issuer** creates the invoice. **Investor** funds it. **Debtor** repays. Amounts private; roles and status public.

**[24 words]**

**DO:** **Connect Wallet** as Issuer. **PAUSE.**

---

### [0:52 – 1:22] DEMO 1 — CREATE (Issuer) (~55 words + 20s silence)

**DO:** Registry panel → **Select** confidential USDC pair (expand preview if needed).

**SAY:**

> Funding uses the **official Wrappers Registry** — composable privacy, any valid ERC-7984 stablecoin.

**DO:** **Create Invoice** — debtor address, face value **1.00**, due **30** days. Point at encrypted face value hint.

**SAY:**

> Debtor and due date are **public**. Face value encrypts client-side before mint.

**DO:** **Mint Confidential Invoice** → confirm. **SILENCE until confirmed.**

**SAY:**

> On Etherscan: invoice exists — face value is a **handle**, not a number. Note the **invoice ID**.

**[48 words + tx wait]**

---

### [1:22 – 1:50] DEMO 2 — FUND (Investor) (~40 words + 18s silence)

**DO:** Switch wallet → label **Investor**. Wrap panel if needed (brief).

**SAY:**

> The **investor** funds with confidential tokens — same registry pair.

**DO:** **Fund & Repay** → Invoice ID **0** (or yours), amount **0.80** → **Fund Invoice** → confirm. **SILENCE.**

**SAY:**

> Status: **Open** to **Funded**. Investor address public; fund amount encrypted.

**[32 words]**

---

### [1:50 – 2:10] DEMO 3 — REPAY (Debtor) (~35 words + 15s silence)

**DO:** Switch to **Debtor** wallet (must match debtor field).

**SAY:**

> Only the **debtor** can record repayment.

**DO:** Repay amount **0.85** → **Record Repayment** → confirm. **SILENCE.**

**SAY:**

> Status **Repaid**. Lifecycle complete: create, fund, repay — all amounts stayed encrypted.

**[28 words]**

---

### [2:10 – 2:28] DECRYPT (optional but strong) (~45 words + 10s silence)

**DO:** **Inspect & Decrypt Invoice** → enter ID → **Decrypt face value** (or funded/repaid) → sign.

**SAY:**

> Authorized parties decrypt via **EIP-712** — ACL from the contract, relayer from Zama. Proves FHE isn't just storage; it's **usable finance**.

**[28 words]**

---

### [2:28 – 2:48] STACK + PUBLIC VS PRIVATE (~55 words)

**DO:** Stay on app or flash simple overlay.

**SAY:**

> **Public:** invoice ID, issuer, debtor, investor, due date, token, status.  
> **Private:** face value, funded amount, repaid amount.
>
> **Stack:** `InvoiceFactory.sol` on Sepolia, **FHEVM**, SDK v3, Next.js, shared registry components. Tests pass; demo live.

**[42 words]**

---

### [2:48 – 3:05] CLOSE (~40 words)

**DO:** Landing hero or end card.

**SAY:**

> **Factor** composes with Zama's official registry — confidential **receivables financing** for on-chain businesses.

> **factor-sigma.vercel.app** on Sepolia. Contract in the description. Thanks — **#ZamaDeveloperProgram**.

**[32 words]**

```
Factor — Confidential Invoice Factoring
https://factor-sigma.vercel.app
Factory: 0x74Cfb858431c91E2C5006CC0155814794d81e2Ac
```

---

## UI click map (2026 layout)

| Step | Location | Action |
|------|----------|--------|
| Enter app | Landing | **Open Factoring App** |
| Token | Left column registry | **Select** pair (preview → expand) |
| Wrap | Right column | **Shield (Wrap)** if investor needs balance |
| Create | Create Invoice | **Mint Confidential Invoice** |
| Fund | Fund & Repay | **Fund Invoice** |
| Repay | Fund & Repay | **Record Repayment** |
| Decrypt | Inspect & Decrypt | **Decrypt face value** / funded / repaid |

---

## YouTube description

```
Factor — Confidential Invoice Factoring | Zama Season 3 Builder

Receivables financing on FHEVM: Issuer → Investor → Debtor. 
Face value, funding, and repayment encrypted as euint64.

🔗 https://factor-sigma.vercel.app
📜 Factory: 0x74Cfb858431c91E2C5006CC0155814794d81e2Ac

#ZamaDeveloperProgram #FHE #FHEVM #DeFi
```

---

## Over time? Cut in this order

1. Problem story (keep one sentence)  
2. Decrypt inspector panel  
3. Public vs private list (say "amounts private, roles public" only)
