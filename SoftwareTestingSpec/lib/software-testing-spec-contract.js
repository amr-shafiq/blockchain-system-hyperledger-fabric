/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class SoftwareTestingSpecContract extends Contract {

    async softwareTestingSpecExists(ctx, softwareTestingSpecId) {
        const buffer = await ctx.stub.getState(softwareTestingSpecId);
        return (!!buffer && buffer.length > 0);
    }

    async createSoftwareTestingSpec(ctx, softwareTestingSpecId, value) {
        const exists = await this.softwareTestingSpecExists(ctx, softwareTestingSpecId);
        if (exists) {
            throw new Error(`The software testing spec ${softwareTestingSpecId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(softwareTestingSpecId, buffer);
    }

    async readSoftwareTestingSpec(ctx, softwareTestingSpecId) {
        const exists = await this.softwareTestingSpecExists(ctx, softwareTestingSpecId);
        if (!exists) {
            throw new Error(`The software testing spec ${softwareTestingSpecId} does not exist`);
        }
        const buffer = await ctx.stub.getState(softwareTestingSpecId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateSoftwareTestingSpec(ctx, softwareTestingSpecId, newValue) {
        const exists = await this.softwareTestingSpecExists(ctx, softwareTestingSpecId);
        if (!exists) {
            throw new Error(`The software testing spec ${softwareTestingSpecId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(softwareTestingSpecId, buffer);
    }

    async deleteSoftwareTestingSpec(ctx, softwareTestingSpecId) {
        const exists = await this.softwareTestingSpecExists(ctx, softwareTestingSpecId);
        if (!exists) {
            throw new Error(`The software testing spec ${softwareTestingSpecId} does not exist`);
        }
        await ctx.stub.deleteState(softwareTestingSpecId);
    }

}

module.exports = SoftwareTestingSpecContract;
