/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
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

class SoftwareTestingSpecContract extends Contract {

    async InitLedger(ctx) {
        const asets = [
            {
                SpecCheckingId: 'ST001', 
                Name: 'Login Page',
                SoftwareModule: '1.0',
                Version: '1.2.1.0',
                Date: '15/11/2022',
                Owner: 'QC',
                AllowParties: 'Customer',
                SourceLoc: '/home/user/Desktop',
            },
            {
                SpecCheckingId: 'ST002', 
                Name: 'Regisration Page',
                SoftwareModule: '1.1',
                Version: '1.2.1.0',
                Date: '15/11/2022',
                Owner: 'QC',
                AllowParties: 'Project Manager',
                SourceLoc: '/home/user/Desktop',
            },
            {
                SpecCheckingId: 'ST003', 
                Name: 'Upload File',
                SoftwareModule: '2.0',
                Version: '1.2.1.0',
                Date: '15/11/2022',
                Owner: 'ni',
                AllowParties: 'Customer, PM',
                SourceLoc: '/home/user/Desktop',
            },

        ];
        for  (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.SpecCheckingId, Buffer.from(JSON.stringify(asset)));
            console.info('Asset ${asset.SpecCheckingId} intialized');
        }
    }

    async createSpecCheking(ctx, specCheckingId, name, softwareModule, version,
        creationDate, owner, allowParties, sourceLoc ) {
            const check = {
                SpecCheckingId: specCheckingId,
                Name: name,
                SoftwareModule: softwareModule,
                Version: version,
                Date: creationDate,
                Owner: owner,
                AllowParties: allowParties,
                SourceLoc: sourceLoc,
            };
            return ctx.stub.putState(specCheckingId, Buffer.from(JSON.stringify(check)));
        }

    async readSpecChecking(ctx, specCheckingId) {
        const specJSON = await ctx.stub.getState(specCheckingId);
        if (!specJSON || specJSON.length === 0) {
            throw new Error('The software testing specification ID ${specCheckingId} does not exist');
        }
        return specJSON.toString();
    }

    async updateModule(ctx, specCheckingId, name, softwareModule, version, sourceLoc) {
        const exists = await ctx.stub.getState(specCheckingId);
        if (!exists || exists.length === 0) {
            throw new Error('The software testing specification ID ${specCheckingId} does not exist');
        }

        const updatedSpecChecking = {
            SpecCheckingId: specCheckingId,
            Name: name,
            SoftwareModule: softwareModule,
            Version: version,
            SourceLoc, sourceLoc,

        };
        return ctx.stub.putState(specCheckingId, Buffer.from(JSON.stringify(updatedSpecChecking)));
    }

    async deleteSpecChecking(ctx, specCheckingId) {
        const exists = await ctx.stub.getState(specCheckingId);
        if (!exists || exists.length === 0) {
            throw new Error('The software testing specification ID ${specCheckingId} does not exist');
        }
        return ctx.stub.deleteState(specCheckingId);
    }

    async ChangeParties(ctx, specCheckingId, newParties) {
        const assetString = await this.readSpecChecking(ctx, specCheckingId);
        const asset = JSON.parse(assetString);
        asset.parties = newParties;
        return ctx.stub.putState(specCheckingId, Buffer.from(JSON.stringify(asset)));
    }

    async getAllResults(ctx) {
        const allResults = [];

        const iterator = await ctx.stub.getStateByRange('','');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from (result.value.value.toString()).toString('utf8');
            
        }
    }
}

describe('MyAssetContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MyAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"my asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"my asset 1002 value"}'));
    });

    describe('#myAssetExists', () => {

        it('should return true for a my asset', async () => {
            await contract.myAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a my asset that does not exist', async () => {
            await contract.myAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMyAsset', () => {

        it('should create a my asset', async () => {
            await contract.createMyAsset(ctx, '1003', 'my asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"my asset 1003 value"}'));
        });

        it('should throw an error for a my asset that already exists', async () => {
            await contract.createMyAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The my asset 1001 already exists/);
        });

    });

    describe('#readMyAsset', () => {

        it('should return a my asset', async () => {
            await contract.readMyAsset(ctx, '1001').should.eventually.deep.equal({ value: 'my asset 1001 value' });
        });

        it('should throw an error for a my asset that does not exist', async () => {
            await contract.readMyAsset(ctx, '1003').should.be.rejectedWith(/The my asset 1003 does not exist/);
        });

    });

    describe('#updateMyAsset', () => {

        it('should update a my asset', async () => {
            await contract.updateMyAsset(ctx, '1001', 'my asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"my asset 1001 new value"}'));
        });

        it('should throw an error for a my asset that does not exist', async () => {
            await contract.updateMyAsset(ctx, '1003', 'my asset 1003 new value').should.be.rejectedWith(/The my asset 1003 does not exist/);
        });

    });

    describe('#deleteMyAsset', () => {

        it('should delete a my asset', async () => {
            await contract.deleteMyAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a my asset that does not exist', async () => {
            await contract.deleteMyAsset(ctx, '1003').should.be.rejectedWith(/The my asset 1003 does not exist/);
        });

    });

});
