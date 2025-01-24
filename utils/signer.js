const { TypedDataUtils, SignTypedDataVersion, concatSig } = require('@metamask/eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');
const ethers = require('ethers');


const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const getDomain = async (provider, verifyerAddress) => {
    try {
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        const chainIdInt = parseInt(chainId.toString());

        const abi = ["function name() view returns (string)"];
        const contract = new ethers.Contract(verifyerAddress, abi, provider);
        let name;
        try {
            name = await contract.name();
        } catch (error) {
            name = "";
        }

        const domain = {
            name: name,
            version: '1',
            chainId: chainIdInt,
            verifyingContract: verifyerAddress
        };
    
        return domain;
    } catch (error) {
        throw new Error('Error getting domain: ', error);
    }
}

const getNonce = async (provider, token, owner) => {
    try {
        const abi = ["function nonce(address owner) view returns (uint256)"];
        const contract = new ethers.Contract(token, abi, provider);
        const nonce = await contract.nonce(owner);
        return nonce;
    } catch (error) {
        throw new Error('Error getting nonce: ', error);
    }
}

const splitSignatureToRSV = (signature) => {
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);
    const v = parseInt(signature.substring(2).substring(128, 130), 16);
    return { r, s, v };
};

const createTypedData = (domain, primaryType, message) => {
    const typedData = (Type) => ({
        domain,
        primaryType: primaryType,
        types: {
            ...Type
        },
        message,
    });
    if (primaryType === "Permit") {
        return typedData({
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        })
    }
    else if (primaryType === "TransferWithAuthorization") {
        return typedData({
            TransferWithAuthorization: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        })
    }
    else if (primaryType === "ForwardRequest") {
        return typedData({
            ForwardRequest: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "gas", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "data", type: "bytes" },
            ],
        })
    }
    else throw new Error("Invalid primary type");
};

const signMetaTx = async(type, provider, tokenAddress, owner, spender, value, deadline = MAX_INT, nonce) => {
    const message = {
        owner: owner.address,
        spender: spender.address,
        value: value,
        nonce: nonce || (await getNonce(provider, tokenAddress, owner)),
        deadline: deadline || MAX_INT,
    };
    const domain = await getDomain(provider, tokenAddress);
    const typedData = createTypedData(domain, type, message);
    const raw_sig = await owner.signTypedData(typedData.domain, typedData.types, typedData.message);
    const sig = splitSignatureToRSV(raw_sig);
    return Object.assign(Object.assign({}, sig), message);
}

const signERC2612Permit = async (provider, tokenAddress, owner, spender, value = MAX_INT, deadline, nonce) => {
    return signMetaTx("Permit", provider, tokenAddress, owner, spender, value, deadline, nonce);
}

const signERC3009TWA = async (provider, tokenAddress, owner, spender, value, deadline, nonce) => {
    return signMetaTx("TransferWithAuthorization", provider, tokenAddress, owner, spender, value, deadline, nonce);
}

const signForward = async (provider, tokenAddress, forwarder, from, gas, data, nonce) => {
    const domain = await getDomain(provider, forwarder);

    const request  = {
        from: from.address, 
        to: tokenAddress, 
        value: 0,
        gas: gas,
        nonce: nonce || (await getNonce(provider, tokenAddress, from)),
        data: data
    };

    const typedData = createTypedData(domain, "ForwardRequest", request);
    const sig = await from.signTypedData(typedData.domain, typedData.types, typedData.message);

    const domainSeparator = bufferToHex(
        TypedDataUtils.hashStruct(
            "EIP712Domain", 
            typedData.domain, 
            {
                EIP712Domain: [
                    {name: "name", type: "string"},
                    {name: "version", type: "string"},
                    {name: "chainId", type: "uint256"},
                    {name: "verifyingContract", type: "address"}
                ]
            }, 
            SignTypedDataVersion.V4
        )
    );

    const GenericParams = 'address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data';
    const TypeName = `ForwardRequest(${GenericParams})`;
    const TypeHash = ethers.id(TypeName);  

    const result = {
        request: request, 
        domainSeparator: domainSeparator, 
        TypeHash: TypeHash, 
        suffixData: '0x', 
        signature: sig
    };

    return Object.assign(result);
}

module.exports = {
    signERC2612Permit,
    signERC3009TWA,
    signForward
}


