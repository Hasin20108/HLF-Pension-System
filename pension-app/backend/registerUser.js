'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }
 
        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509', 
        };
        await wallet.put('appUser', x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main();




// 'use strict';


// const { Wallets } = require('fabric-network');
// const FabricCAServices = require('fabric-ca-client');
// const path = require('path');
// const fs = require('fs');

// require('dotenv').config(); // optional, to use environment variables

// // Configuration variables (can be overridden via environment variables)
// const WALLET_PATH = process.env.WALLET_PATH || path.join(process.cwd(), 'wallet');
// const USER_ID = process.env.USER_ID || 'appUser';
// const ADMIN_ID = process.env.ADMIN_ID || 'admin';
// const MSP_ID = process.env.MSP_ID || 'Org1MSP';
// const AFFILIATION = process.env.AFFILIATION || 'org1.department1';
// const ROLE = process.env.ROLE || 'client';
// const CONNECTION_PROFILE = process.env.CONNECTION_PROFILE || path.resolve(__dirname, 'connection-org1.json');

// async function main() {
//     try {
//         console.log('--- Hyperledger Fabric User Registration and Enrollment ---');

//         // Load connection profile
//         if (!fs.existsSync(CONNECTION_PROFILE)) {
//             throw new Error(`Connection profile not found at path: ${CONNECTION_PROFILE}`);
//         }
//         const ccp = JSON.parse(fs.readFileSync(CONNECTION_PROFILE, 'utf8'));
//         console.log('Loaded connection profile.');

//         // Create wallet folder if it doesn't exist
//         if (!fs.existsSync(WALLET_PATH)) {
//             fs.mkdirSync(WALLET_PATH, { recursive: true });
//             console.log(`Created wallet folder at: ${WALLET_PATH}`);
//         }
//         const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
//         console.log(`Using wallet path: ${WALLET_PATH}`);

//         // Check if user identity already exists
//         const userIdentity = await wallet.get(USER_ID);
//         if (userIdentity) {
//             console.log(`An identity for the user "${USER_ID}" already exists in the wallet. No action taken.`);
//             return;
//         }

//         // Check if admin identity exists
//         const adminIdentity = await wallet.get(ADMIN_ID);
//         if (!adminIdentity) {
//             console.error(`Admin identity "${ADMIN_ID}" not found in the wallet.`);
//             console.error('Please enroll the admin user before retrying (run enrollAdmin.js).');
//             return;
//         }
//         console.log(`Admin identity "${ADMIN_ID}" found.`);

//         // Create a new CA client
//         const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
//         if (!caInfo) {
//             throw new Error('CA information not found in connection profile.');
//         }

//         const tlsOptions = caInfo.tlsCACerts ? { trustedRoots: caInfo.tlsCACerts.pem, verify: true } : { verify: false };
//         if (!tlsOptions.verify) {
//             console.warn('TLS verification is disabled (for local development only).');
//         }
//         const ca = new FabricCAServices(caInfo.url, tlsOptions, caInfo.caName);
//         console.log(`Connected to CA at ${caInfo.url}`);

//         // Build admin user object for authenticating with CA
//         const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
//         const adminUser = await provider.getUserContext(adminIdentity, ADMIN_ID);

//         // Register the user if not already registered
//         console.log(`Registering user "${USER_ID}" with CA...`);
//         let secret;
//         try {
//             secret = await ca.register({
//                 affiliation: AFFILIATION,
//                 enrollmentID: USER_ID,
//                 role: ROLE
//             }, adminUser);
//         } catch (regError) {
//             if (regError.toString().includes('is already registered')) {
//                 console.warn(`User "${USER_ID}" is already registered with the CA.`);
//             } else {
//                 throw regError;
//             }
//         }

//         // Enroll the user
//         console.log(`Enrolling user "${USER_ID}" with CA...`);
//         const enrollment = await ca.enroll({
//             enrollmentID: USER_ID,
//             enrollmentSecret: secret
//         });

//         // Import identity into wallet
//         const x509Identity = {
//             credentials: {
//                 certificate: enrollment.certificate,
//                 privateKey: enrollment.key.toBytes(),
//             },
//             mspId: MSP_ID,
//             type: 'X.509',
//         };
//         await wallet.put(USER_ID, x509Identity);
//         console.log(`Successfully registered and enrolled user "${USER_ID}" and imported it into the wallet.`);

//     } catch (error) {
//         console.error(`\n[ERROR] Failed to register and enroll user "${USER_ID}": ${error.message || error}`);
//         process.exit(1);
//     }
// }

// main();
