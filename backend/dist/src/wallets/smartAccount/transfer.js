"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const helpers_1 = require("../helpers");
async function main(config, t, amt, withPM) {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(config.rpcUrl);
    const paymasterAPI = withPM ? helpers_1.getVerifyingPaymaster(config.paymasterUrl, config.entryPoint) : undefined;
    console.log("paymasterAPI", paymasterAPI);
    const accountAPI = helpers_1.getSimpleAccount(provider, config.signingKey, config.entryPoint, config.simpleAccountFactory, paymasterAPI);
    const target = ethers_1.ethers.utils.getAddress(t);
    const value = ethers_1.ethers.utils.parseEther(amt);
    const op = await accountAPI.createSignedUserOp({
        target,
        value,
        data: '0x',
        ...(await helpers_1.getGasFee(provider)),
    });
    const opCode = await helpers_1.printOp(op);
    console.log(`Signed UserOperation: ${opCode}`);
    const client = await helpers_1.getHttpRpcClient(provider, config.bundlerUrl, config.entryPoint);
    const uoHash = await client.sendUserOpToBundler(op);
    console.log(`UserOpHash: ${uoHash}`);
    console.log('Waiting for transaction...');
    const txHash = await accountAPI.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);
    return { op: opCode, uoHash, txHash };
}
exports.default = main;
//# sourceMappingURL=transfer.js.map