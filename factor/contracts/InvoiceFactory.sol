// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title InvoiceFactory
/// @notice Mints confidential receivables with FHE-encrypted face values.
contract InvoiceFactory is ZamaEthereumConfig {
    enum Status {
        Open,
        Funded,
        Repaid,
        Cancelled
    }

    struct Invoice {
        address issuer;
        address debtor;
        address fundingToken;
        address investor;
        uint256 dueDate;
        euint64 faceValue;
        euint64 fundedAmount;
        euint64 repaidAmount;
        Status status;
        bool exists;
    }

    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) private _invoices;

    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed issuer,
        address indexed debtor,
        address fundingToken,
        uint256 dueDate
    );
    event InvoiceFunded(uint256 indexed invoiceId, address indexed investor);
    event InvoiceRepaid(uint256 indexed invoiceId, address indexed debtor);

    function createInvoice(
        address debtor,
        address fundingToken,
        uint256 dueDate,
        externalEuint64 encryptedFaceValue,
        bytes calldata inputProof
    ) external returns (uint256 invoiceId) {
        require(debtor != address(0), "Invalid debtor");
        require(fundingToken != address(0), "Invalid token");
        require(dueDate > block.timestamp, "Due date must be future");

        euint64 faceValue = FHE.fromExternal(encryptedFaceValue, inputProof);
        invoiceId = nextInvoiceId++;

        euint64 zeroFunded = FHE.asEuint64(0);
        euint64 zeroRepaid = FHE.asEuint64(0);

        Invoice storage inv = _invoices[invoiceId];
        inv.issuer = msg.sender;
        inv.debtor = debtor;
        inv.fundingToken = fundingToken;
        inv.dueDate = dueDate;
        inv.faceValue = faceValue;
        inv.fundedAmount = zeroFunded;
        inv.repaidAmount = zeroRepaid;
        inv.status = Status.Open;
        inv.exists = true;

        FHE.allowThis(faceValue);
        FHE.allow(faceValue, msg.sender);
        FHE.allow(faceValue, debtor);

        FHE.allowThis(zeroFunded);
        FHE.allowThis(zeroRepaid);

        emit InvoiceCreated(invoiceId, msg.sender, debtor, fundingToken, dueDate);
    }

    function fundInvoice(
        uint256 invoiceId,
        externalEuint64 encryptedFundAmount,
        bytes calldata inputProof
    ) external {
        Invoice storage inv = _requireOpen(invoiceId);
        require(inv.investor == address(0), "Already funded");

        euint64 fundAmount = FHE.fromExternal(encryptedFundAmount, inputProof);
        inv.investor = msg.sender;
        inv.fundedAmount = fundAmount;
        inv.status = Status.Funded;

        FHE.allowThis(fundAmount);
        FHE.allow(fundAmount, msg.sender);
        FHE.allow(fundAmount, inv.issuer);
        FHE.allow(fundAmount, inv.debtor);
        FHE.allow(inv.faceValue, msg.sender);

        emit InvoiceFunded(invoiceId, msg.sender);
    }

    function recordRepayment(
        uint256 invoiceId,
        externalEuint64 encryptedRepayAmount,
        bytes calldata inputProof
    ) external {
        Invoice storage inv = _invoices[invoiceId];
        require(inv.exists, "No invoice");
        require(inv.status == Status.Funded, "Not funded");
        require(msg.sender == inv.debtor, "Only debtor");

        euint64 repayAmount = FHE.fromExternal(encryptedRepayAmount, inputProof);
        euint64 newRepaid = FHE.add(inv.repaidAmount, repayAmount);
        inv.repaidAmount = newRepaid;
        inv.status = Status.Repaid;

        FHE.allowThis(newRepaid);
        FHE.allow(newRepaid, inv.debtor);
        FHE.allow(newRepaid, inv.investor);
        FHE.allow(newRepaid, inv.issuer);

        emit InvoiceRepaid(invoiceId, msg.sender);
    }

    function cancelInvoice(uint256 invoiceId) external {
        Invoice storage inv = _requireOpen(invoiceId);
        require(msg.sender == inv.issuer, "Only issuer");
        inv.status = Status.Cancelled;
    }

    function getInvoice(uint256 invoiceId)
        external
        view
        returns (
            address issuer,
            address debtor,
            address fundingToken,
            address investor,
            uint256 dueDate,
            euint64 faceValue,
            euint64 fundedAmount,
            euint64 repaidAmount,
            Status status
        )
    {
        Invoice storage inv = _invoices[invoiceId];
        require(inv.exists, "No invoice");
        return (
            inv.issuer,
            inv.debtor,
            inv.fundingToken,
            inv.investor,
            inv.dueDate,
            inv.faceValue,
            inv.fundedAmount,
            inv.repaidAmount,
            inv.status
        );
    }

    function allowFaceValueDecrypt(uint256 invoiceId, address viewer) external {
        _allowPartyDecrypt(invoiceId, viewer);
        FHE.allow(_invoices[invoiceId].faceValue, viewer);
    }

    function allowFundedAmountDecrypt(uint256 invoiceId, address viewer) external {
        _allowPartyDecrypt(invoiceId, viewer);
        FHE.allow(_invoices[invoiceId].fundedAmount, viewer);
    }

    function allowRepaidAmountDecrypt(uint256 invoiceId, address viewer) external {
        _allowPartyDecrypt(invoiceId, viewer);
        FHE.allow(_invoices[invoiceId].repaidAmount, viewer);
    }

    function _allowPartyDecrypt(uint256 invoiceId, address /* viewer */) private view {
        Invoice storage inv = _invoices[invoiceId];
        require(inv.exists, "No invoice");
        require(
            msg.sender == inv.issuer || msg.sender == inv.investor || msg.sender == inv.debtor,
            "Not authorized"
        );
    }

    function _requireOpen(uint256 invoiceId) private view returns (Invoice storage inv) {
        inv = _invoices[invoiceId];
        require(inv.exists, "No invoice");
        require(inv.status == Status.Open, "Not open");
    }
}
