import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("InvoiceFactory", function () {
  before(function () {
    if (!fhevm.isMock) {
      this.skip();
    }
  });

  it("creates an invoice with encrypted face value", async function () {
    const [issuer, debtor] = await ethers.getSigners();
    const factory = await ethers.deployContract("InvoiceFactory");

    const faceValue = 1_000_000n;
    const encrypted = await fhevm
      .createEncryptedInput(await factory.getAddress(), issuer.address)
      .add64(faceValue)
      .encrypt();

    const dueDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
    const fundingToken = ethers.Wallet.createRandom().address;

    const tx = await factory
      .connect(issuer)
      .createInvoice(debtor.address, fundingToken, dueDate, encrypted.handles[0], encrypted.inputProof);
    await tx.wait();

    const inv = await factory.getInvoice(0);
    expect(inv.issuer).to.equal(issuer.address);
    expect(inv.debtor).to.equal(debtor.address);
    expect(inv.status).to.equal(0); // Open

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      inv.faceValue,
      await factory.getAddress(),
      issuer,
    );
    expect(decrypted).to.equal(faceValue);
  });

  it("funds an open invoice", async function () {
    const [issuer, debtor, investor] = await ethers.getSigners();
    const factory = await ethers.deployContract("InvoiceFactory");

    const faceValue = 2_000_000n;
    const encryptedFace = await fhevm
      .createEncryptedInput(await factory.getAddress(), issuer.address)
      .add64(faceValue)
      .encrypt();

    const dueDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
    const fundingToken = ethers.Wallet.createRandom().address;

    await factory
      .connect(issuer)
      .createInvoice(debtor.address, fundingToken, dueDate, encryptedFace.handles[0], encryptedFace.inputProof);

    const fundAmount = 1_500_000n;
    const encryptedFund = await fhevm
      .createEncryptedInput(await factory.getAddress(), investor.address)
      .add64(fundAmount)
      .encrypt();

    await factory
      .connect(investor)
      .fundInvoice(0, encryptedFund.handles[0], encryptedFund.inputProof);

    const inv = await factory.getInvoice(0);
    expect(inv.investor).to.equal(investor.address);
    expect(inv.status).to.equal(1); // Funded

    const decryptedFund = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      inv.fundedAmount,
      await factory.getAddress(),
      investor,
    );
    expect(decryptedFund).to.equal(fundAmount);
  });

  it("records repayment with decryptable cumulative repaid amount", async function () {
    const [issuer, debtor, investor] = await ethers.getSigners();
    const factory = await ethers.deployContract("InvoiceFactory");

    const faceValue = 2_000_000n;
    const encryptedFace = await fhevm
      .createEncryptedInput(await factory.getAddress(), issuer.address)
      .add64(faceValue)
      .encrypt();

    const dueDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
    const fundingToken = ethers.Wallet.createRandom().address;

    await factory
      .connect(issuer)
      .createInvoice(debtor.address, fundingToken, dueDate, encryptedFace.handles[0], encryptedFace.inputProof);

    const fundAmount = 1_500_000n;
    const encryptedFund = await fhevm
      .createEncryptedInput(await factory.getAddress(), investor.address)
      .add64(fundAmount)
      .encrypt();

    await factory
      .connect(investor)
      .fundInvoice(0, encryptedFund.handles[0], encryptedFund.inputProof);

    const repayAmount = 1_600_000n;
    const encryptedRepay = await fhevm
      .createEncryptedInput(await factory.getAddress(), debtor.address)
      .add64(repayAmount)
      .encrypt();

    await factory
      .connect(debtor)
      .recordRepayment(0, encryptedRepay.handles[0], encryptedRepay.inputProof);

    const inv = await factory.getInvoice(0);
    expect(inv.status).to.equal(2); // Repaid

    const decryptedRepaid = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      inv.repaidAmount,
      await factory.getAddress(),
      investor,
    );
    expect(decryptedRepaid).to.equal(repayAmount);
  });
});
