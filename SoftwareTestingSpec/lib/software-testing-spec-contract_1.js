/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class SoftwareTestingSpecContract extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                SpecCheckingId: 'ST001',
                Name: 'Login Page',
                SoftwareModule: '1.0',
                Version: '1.2.1.0',
                Date: '23/5/2022',
                Owner: 'QC',
                AllowParties: 'Customer',
                SourceLoc: '/home/user/Desktop',
            },
            {
                SpecCheckingId: 'ST002',
                Name: 'Registration Page',
                SoftwareModule: '1.1',
                Version: '1.2.1.0',
                Date: '23/5/2022',
                Owner: 'QC',
                AllowParties: 'Project Manager',
                SourceLoc: '/home/user/Desktop',
            },
            {
                SpecCheckingId: 'ST003',
                Name: 'Upload file',
                SoftwareModule: '2.0',
                Version: '1.2.1.0',
                Date: '20/5/2022',
                Owner: 'ni',
                AllowParties: 'Customer,PM',
                SourceLoc: '/home/user/Desktop',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.SpecCheckingId, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.SpecCheckingId} initialized`);
        }
    }

    // createSpecChecking issues a new software testing with given details.
    async createSpecChecking(ctx, specCheckingId, name, softwareModule, version, creationDate, owner, allowParties, sourceLoc) {
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

    // readSpecChecking returns the data stored with given id.
    async readSpecChecking(ctx, specCheckingId) {
        const specJSON = await ctx.stub.getState(specCheckingId); // get the data from chaincode state
        if (!specJSON || specJSON.length === 0) {
            throw new Error(`The software testing specification ID ${specCheckingId} does not exist`);
        }
        return specJSON.toString();
    }

    // updateModule updates an existing software testing specification with provided parameters.
    async updateModule(ctx, specCheckingId, name, softwareModule, version, sourceLoc) {
        const exists = await ctx.stub.getState(specCheckingId);
        if (!exists || exists.length === 0) {
            throw new Error(`The software testing specification ID ${specCheckingId} does not exist`);
        }

        // overwriting original data with new data
        const updatedspecChecking = {
            SpecCheckingId: specCheckingId,
            Name: name,
            SoftwareModule: softwareModule,
            Version: version,
            SourceLoc: sourceLoc,
        };
        return ctx.stub.putState(specCheckingId, Buffer.from(JSON.stringify(updatedspecChecking)));
    }

    // deleteSpecChecking deletes an given data from the world state.
    async deleteSpecChecking(ctx, specCheckingId) {
        const exists = await ctx.stub.getState(specCheckingId);
        if (!exists || exists.length === 0) {
            throw new Error(`The software testing specification ID ${specCheckingId} does not exist`);
        }
        return ctx.stub.deleteState(specCheckingId);
    }

    // ChangeParticipant updates the participant field of software testing specification with given in the world state.
    async ChangeParties(ctx, specCheckingId, newParties) {
        const assetString = await this.readSpecChecking(ctx, specCheckingId);
        const asset = JSON.parse(assetString);
        asset.parties = newParties;
        return ctx.stub.putState(specCheckingId, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllResults returns all data found in the world state.
    async GetAllResults(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}

module.exports = SoftwareTestingSpecContract;
