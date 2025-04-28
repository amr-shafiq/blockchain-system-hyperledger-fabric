/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { SoftwareTestingSpecContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('SoftwareTestingSpecContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new SoftwareTestingSpecContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"software testing spec 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"software testing spec 1002 value"}'));
    });

    describe('#softwareTestingSpecExists', () => {

        it('should return true for a software testing spec', async () => {
            await contract.softwareTestingSpecExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a software testing spec that does not exist', async () => {
            await contract.softwareTestingSpecExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createSoftwareTestingSpec', () => {

        it('should create a software testing spec', async () => {
            await contract.createSoftwareTestingSpec(ctx, '1003', 'software testing spec 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"software testing spec 1003 value"}'));
        });

        it('should throw an error for a software testing spec that already exists', async () => {
            await contract.createSoftwareTestingSpec(ctx, '1001', 'myvalue').should.be.rejectedWith(/The software testing spec 1001 already exists/);
        });

    });

    describe('#readSoftwareTestingSpec', () => {

        it('should return a software testing spec', async () => {
            await contract.readSoftwareTestingSpec(ctx, '1001').should.eventually.deep.equal({ value: 'software testing spec 1001 value' });
        });

        it('should throw an error for a software testing spec that does not exist', async () => {
            await contract.readSoftwareTestingSpec(ctx, '1003').should.be.rejectedWith(/The software testing spec 1003 does not exist/);
        });

    });

    describe('#updateSoftwareTestingSpec', () => {

        it('should update a software testing spec', async () => {
            await contract.updateSoftwareTestingSpec(ctx, '1001', 'software testing spec 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"software testing spec 1001 new value"}'));
        });

        it('should throw an error for a software testing spec that does not exist', async () => {
            await contract.updateSoftwareTestingSpec(ctx, '1003', 'software testing spec 1003 new value').should.be.rejectedWith(/The software testing spec 1003 does not exist/);
        });

    });

    describe('#deleteSoftwareTestingSpec', () => {

        it('should delete a software testing spec', async () => {
            await contract.deleteSoftwareTestingSpec(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a software testing spec that does not exist', async () => {
            await contract.deleteSoftwareTestingSpec(ctx, '1003').should.be.rejectedWith(/The software testing spec 1003 does not exist/);
        });

    });

});
