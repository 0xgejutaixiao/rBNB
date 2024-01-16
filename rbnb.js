const Web3 = require('web3');
const axios = require("axios");
const https = require("https");
const Logger = require("@youpaichris/logger");
const logger = new Logger();
const privateKey = ''; // 私钥
const provider = new Web3.providers.HttpProvider('https://binance.nodereal.io');
const web3 = new Web3(provider);
const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
const currentChallenge = Web3.utils.toHex("0x72424e4200000000000000000000000000000000000000000000000000000000");

const account = wallet.address;

console.log("钱包地址: ", account);

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});

function findSolution(difficulty) {
    while (1) {
        const random_value = Web3.utils.randomHex(32);
        const potential_solution = Web3.utils.toHex(random_value);
        const hashed_solution = Web3.utils.soliditySha3(
            web3.eth.abi.encodeParameters(
                ["bytes32", "bytes32", "address"],
                [potential_solution, currentChallenge, account]
            )
        );
        if (hashed_solution.startsWith(difficulty)) {
            return potential_solution;
        }
    }
}

//提交数据

async function send_request(solution) {
    // construct a request
    const url = "https://ec2-18-217-135-255.us-east-2.compute.amazonaws.com/validate";
    const jsonData = {
        solution: solution,
        challenge: "0x72424e4200000000000000000000000000000000000000000000000000000000",
        address: account,
        difficulty: "0x99999",
        tick: "rBNB",
    };
    headers = {
        authority: "ec2-18-217-135-255.us-east-2.compute.amazonaws.com",
        accept: "application/json, text/plain, */*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://bnb.reth.cc",
        pragma: "no-cache",
        referer: "https://bnb.reth.cc/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    // send requests
    try {
        const response = await axiosInstance.post(url, jsonData, { headers: headers });
        logger.success(response.data);
    } catch (error) {
        logger.error('错误:' + error);
    }
}

//查询余额

async function Check_balance() {
    // construct a request
    const url = "https://ec2-18-217-135-255.us-east-2.compute.amazonaws.com/balance?address=" + account;

    headers = {
        authority: "ec2-18-217-135-255.us-east-2.compute.amazonaws.com",
        accept: "application/json, text/plain, */*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://bnb.reth.cc",
        pragma: "no-cache",
        referer: "https://bnb.reth.cc/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    // send requests
    try {
        const response = await axiosInstance.get(url, { headers: headers });
        logger.success(response.data);
    } catch (error) {
        logger.error('错误:' + error);
    }
}


async function main(difficulty) {
    let count = 0;
    while (true) {
        let solution = findSolution(difficulty);
        await send_request(solution);
        //await Check_balance(); //查询余额
        console.log(`第${++count}次已完成, solution: ${solution}`);
    }
}

main("0x99999");