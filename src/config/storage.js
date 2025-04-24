const Client = require("@web3-storage/w3up-client");

class Web3StorageClient {
    static #instance = null;
    #client = null;

    constructor() {
        if (Web3StorageClient.#instance) {
            throw new Error("Use Web3StorageClient.getInstance() to get the singleton instance");
        }
    }

    static getInstance() {
        if (!Web3StorageClient.#instance) {
            Web3StorageClient.#instance = new Web3StorageClient();
        }
        return Web3StorageClient.#instance;
    }

    async initialize() {
        if (!this.#client) {
            this.#client = await Client.create();
            const account = await this.#client.login('teguh180902@gmail.com');
            await account.provision('did:key:z6MkmgBUoe7WRA4rSG8UoKy6dhsMN1bMgJVnCks16BfFp1wC');
            console.log('✅ Web3.Storage client initialized');
        }
    }

    async uploadFile(file) {
        if (!this.#client) {
            throw new Error("Client not initialized. Call initialize() first.");
        }
        if (!(file instanceof File)) {
            throw new Error("Invalid file object provided");
        }
        console.log('Uploading file:', file.name);
        const root = await this.#client.uploadDirectory([file]);
        const cid = root.toString();
        console.log('File uploaded with CID:', cid);
        return cid;
    }
}

module.exports = Web3StorageClient;