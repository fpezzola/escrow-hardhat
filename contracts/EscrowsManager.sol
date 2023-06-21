// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./Escrow.sol";

contract EscrowsManager {
    Escrow[] escrows;
    struct EscrowDef {
        address contractAddress;
        string name;
        address arbiter;
        address beneficiary;
        address depositor;
        Escrow.Status status;
        uint expiresAt;
        uint value;
    }

    event NewEscrow(
        string name,
        address arbiter,
        address beneficiary,
        address depositor,
        uint expiresInSeconds
    );

    function newEscrow(
        string calldata _name,
        address _arbiter,
        address _beneficiary,
        uint _expiresInSeconds
    ) external payable returns (Escrow) {
        Escrow escrow = new Escrow{value: msg.value}(
            _name,
            _arbiter,
            _beneficiary,
            _expiresInSeconds
        );
        emit NewEscrow(
            _name,
            _arbiter,
            _beneficiary,
            msg.sender,
            _expiresInSeconds
        );
        escrows.push(escrow);
        return escrow;
    }

    function listEscrows(
        uint _page,
        uint _size,
        //scoped contracts are those where the sender is involved
        bool onlyScoped
    ) public view returns (EscrowDef[] memory) {
        require(_page > 0, "You can start requesting by page 1.");
        uint _startIdx = (_page * _size) - _size;
        uint elements = 0;
        if (escrows.length == 0 || _startIdx > escrows.length - 1) {
            return new EscrowDef[](0);
        }
        Escrow[] memory _accountEscrows = new Escrow[](escrows.length);
        for (uint i; i < escrows.length; i++) {
            Escrow e = escrows[i];
            if (
                e.arbiter() == msg.sender ||
                e.beneficiary() == msg.sender ||
                e.depositor() == msg.sender ||
                !onlyScoped
            ) {
                _accountEscrows[elements] = e;
                elements++;
            }
        }

        if (elements == 0 || _startIdx > elements - 1) {
            return new EscrowDef[](0);
        }

        uint _finalIdx = _startIdx + _size - 1;
        if ((elements - 1) < _finalIdx) {
            _finalIdx = (elements - 1);
        }
        EscrowDef[] memory _pageEscrows = new EscrowDef[](
            _finalIdx - _startIdx + 1
        );
        uint pageIdx = 0;
        for (uint i = _startIdx; i <= _finalIdx; i++) {
            Escrow escrow = _accountEscrows[i];
            _pageEscrows[pageIdx] = EscrowDef(
                address(escrow),
                escrow.name(),
                escrow.arbiter(),
                escrow.beneficiary(),
                escrow.depositor(),
                escrow.status(),
                escrow.expiresAt(),
                address(escrow).balance
            );
            pageIdx++;
        }
        return _pageEscrows;
    }
}
