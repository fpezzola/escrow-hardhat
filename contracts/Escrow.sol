// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
    enum Status {
        PENDING,
        APPROVED,
        EXPIRED,
        REFUNDED
    }
    address public arbiter;
    address public beneficiary;
    address public depositor;
    string public name;
    uint public expiresAt;
    Status public status;

    constructor(
        string memory _name,
        address _arbiter,
        address _beneficiary,
        uint _expiresInSeconds
    ) payable {
        name = _name;
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = tx.origin;
        status = Status.PENDING;
        if (_expiresInSeconds > 0) {
            expiresAt = block.timestamp + _expiresInSeconds;
        }
    }

    event Approved(uint);
    event Expired();

    function approve() external {
        require(
            !isExpired(),
            "The contract is expired. Depositor can claim back the deposited amount."
        );
        require(msg.sender == arbiter);
        uint balance = address(this).balance;
        (bool sent, ) = payable(beneficiary).call{value: balance}("");
        require(sent, "Failed to send Ether");
        emit Approved(balance);
        status = Status.APPROVED;
    }

    function claim() external {
        require(
            msg.sender == depositor,
            "Only depositor can claim back the funds."
        );
        (bool sent, ) = payable(depositor).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
        status = Status.REFUNDED;
    }

    function isExpired() internal returns (bool) {
        if (expiresAt > 0 && block.timestamp > expiresAt) {
            status = Status.EXPIRED;
            emit Expired();
            return true;
        }
        return false;
    }
}
