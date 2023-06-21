const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Escrow manager", () => {
  async function deployManager() {
    const manager = await ethers.deployContract("EscrowsManager");
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
    return {
      manager,
      signer1,
      signer2,
      signer3,
      signer4,
    };
  }

  it("Should list deployed contracts", async () => {
    const { manager, signer1, signer2, signer3 } = await loadFixture(
      deployManager
    );
    await manager.newEscrow("Test0", signer2.address, signer3.address, 0);
    await manager.newEscrow("Test1", signer2.address, signer3.address, 0);
    await manager.newEscrow("Test2", signer2.address, signer3.address, 0);
    const escrows = await manager.listEscrows(1, 10, true);
    expect(escrows).to.have.length(3);
    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];
      expect(escrow.name).to.equal(`Test${i}`);
      expect(escrow.depositor).to.equal(signer1.address);
      expect(escrow.arbiter).to.equal(signer2.address);
      expect(escrow.beneficiary).to.equal(signer3.address);
    }
  });

  it("Should list deployed contracts where signer2 is involved", async () => {
    const { manager, signer1, signer2, signer3, signer4 } = await loadFixture(
      deployManager
    );
    await manager.newEscrow("Test0", signer2.address, signer3.address, 0);
    await manager.newEscrow("Test1", signer2.address, signer3.address, 0);
    await manager.newEscrow("NotInvolved", signer4.address, signer3.address, 0);

    const escrows = await manager.connect(signer2).listEscrows(1, 10, true);
    expect(escrows).to.have.length(2);
    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];
      expect(escrow.name).to.equal(`Test${i}`);
      expect(escrow.depositor).to.equal(signer1.address);
      expect(escrow.arbiter).to.equal(signer2.address);
      expect(escrow.beneficiary).to.equal(signer3.address);
    }
  });

  it("Should return escrows from 2nd page", async () => {
    const { manager, signer2, signer3 } = await loadFixture(deployManager);
    for (let i = 0; i < 20; i++) {
      await manager.newEscrow(`Test${i}`, signer2.address, signer3.address, 0);
    }
    const escrows = await manager.listEscrows(2, 10, true);
    expect(escrows).to.have.length(10);
    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];
      const idx = i + 10;
      expect(escrow.name).to.equal(`Test${idx}`);
    }
  });
  it("Should return scoped escrows from 2nd page filtered by signer1", async () => {
    const { manager, signer1, signer2, signer3, signer4 } = await loadFixture(
      deployManager
    );
    //create 20 escrows
    // 10 for signer1
    // 10 for signer4
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0) {
        await manager
          .connect(signer1)
          .newEscrow(`Test${i}`, signer2.address, signer3.address, 0);
      } else {
        await manager
          .connect(signer4)
          .newEscrow(`Test${i}`, signer2.address, signer3.address, 0);
      }
    }
    //request 2nd page taken by 8.
    //signer 1 has 10 escrows, meaning that page 2 will have 2 elements.
    const escrows = await manager.listEscrows(2, 8, true);
    expect(escrows).to.have.length(2);
    const escrow1 = escrows[0];
    const escrow2 = escrows[1];
    expect(escrow1.name).to.equal(`Test16`);
    expect(escrow2.name).to.equal(`Test18`);
  });

  it("Should return all escrows from 2nd page", async () => {
    const { manager, signer1, signer2, signer3, signer4 } = await loadFixture(
      deployManager
    );
    //create 20 escrows
    // 10 for signer1
    // 10 for signer4
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0) {
        await manager
          .connect(signer1)
          .newEscrow(`Test${i}`, signer2.address, signer3.address, 0);
      } else {
        await manager
          .connect(signer4)
          .newEscrow(`Test${i}`, signer2.address, signer3.address, 0);
      }
    }
    //request 2nd page taken by 8.
    //as we are not listing only scoped escrows, we will have 8 elements
    const escrows = await manager.listEscrows(2, 8, false);
    expect(escrows).to.have.length(8);
  });
});
