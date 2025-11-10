'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() { 
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();


// 'use strict';

// const FabricCAServices = require('fabric-ca-client');
// const { Wallets } = require('fabric-network');
// const fs = require('fs');
// const path = require('path');

// // --- CONFIGURATION ---
// // Default wallet location
// const WALLET_PATH = path.join(process.cwd(), 'wallet');
// // Admin credentials from environment variables or defaults
// const ENROLLMENT_ID = process.env.FABRIC_CA_ENROLLMENT_ID || 'admin';
// const ENROLLMENT_SECRET = process.env.FABRIC_CA_ENROLLMENT_SECRET || 'adminpw';
// const MSP_ID = 'Org1MSP'; // MSP ID of the organization

// /**
//  * Enrolls the admin user for the Fabric network.
//  * This function will create a wallet directory if it doesn't exist,
//  * connect to the Certificate Authority, enroll the admin, and store
//  * the generated identity credentials in the wallet.
//  */
// async function main() {
//     console.log('🚀 Starting admin enrollment script...');

//     try {
//         // --- 1. Load Network Configuration ---
//         console.log('INFO: Loading connection profile...');
//         const ccpPath = path.resolve(__dirname, 'connection-org1.json');
//         if (!fs.existsSync(ccpPath)) {
//             throw new Error(`Connection profile not found at ${ccpPath}`);
//         }
//         const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

//         // --- 2. Setup Wallet ---
//         console.log(`INFO: Setting up wallet at: ${WALLET_PATH}`);
//         // Ensure the wallet directory exists
//         fs.mkdirSync(WALLET_PATH, { recursive: true });
//         const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

//         // --- 3. Check if Admin Identity Already Exists ---
//         console.log(`INFO: Checking for existing admin identity "${ENROLLMENT_ID}"...`);
//         const identity = await wallet.get(ENROLLMENT_ID);
//         if (identity) {
//             console.log(`✅ An identity for the admin user "${ENROLLMENT_ID}" already exists in the wallet.`);
//             console.log('Enrollment not required.');
//             return; // Exit script successfully
//         }

//         // --- 4. Setup CA Client ---
//         console.log('INFO: Connecting to the Certificate Authority...');
//         const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
//         const caTLSCACerts = caInfo.tlsCACerts.pem;

//         // Create a new CA client for interacting with the CA.
//         // IMPORTANT: In a production environment, 'verify' should be true.
//         // The 'trustedRoots' property should be properly configured with the CA's root certificate.
//         const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

//         // --- 5. Enroll Admin User ---
//         console.log(`INFO: Enrolling admin user "${ENROLLMENT_ID}"...`);
//         const enrollment = await ca.enroll({
//             enrollmentID: ENROLLMENT_ID,
//             enrollmentSecret: ENROLLMENT_SECRET
//         });
//         console.log('INFO: Enrollment successful.');

//         // --- 6. Create and Store Identity in Wallet ---
//         const x509Identity = {
//             credentials: {
//                 certificate: enrollment.certificate,
//                 privateKey: enrollment.key.toBytes(),
//             },
//             mspId: MSP_ID,
//             type: 'X.509',
//         };

//         console.log(`INFO: Storing admin identity in the wallet...`);
//         await wallet.put(ENROLLMENT_ID, x509Identity);

//         console.log(`✅ Successfully enrolled admin user "${ENROLLMENT_ID}" and imported it into the wallet.`);
//         console.log('Script finished successfully.');

//     } catch (error) {
//         console.error('❌ Failed to enroll admin user:');
//         console.error(error.stack || error);
//         process.exit(1);
//     }
// }

// // --- Execute Script ---
// main();
