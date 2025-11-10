'use strict';

const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;

// ---------------- Helper: Get Contract ----------------
async function getContract() {
  try {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
      throw new Error('An identity for the user "appUser" does not exist in the wallet. Run the registerUser.js application before retrying.');
    }

    const ccpPath = path.resolve(__dirname, '..', '..', 'blockchain-network', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('pension');

    return { contract, gateway };
  } catch (error) {
    console.error(`Failed to get contract: ${error}`);
    // Exiting is harsh for a server, better to throw and let the caller handle it.
    throw new Error(`Failed to set up Fabric connection: ${error.message}`);
  }
}

// ---------------- API Endpoints ----------------

// GET all pensions
app.get('/pensions', async (req, res) => {
  let gateway;
  try {
    const { contract, gateway: gw } = await getContract();
    gateway = gw;
    const result = await contract.evaluateTransaction('GetAllPensions');
    const data = result.toString();
    res.json(data ? JSON.parse(data) : []);
  } catch (error) {
    console.error('❌ Failed to fetch pensions:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// GET one pension
app.get('/pensions/:id', async (req, res) => {
  let gateway;
  try {
    const { contract, gateway: gw } = await getContract();
    gateway = gw;
    const result = await contract.evaluateTransaction('ReadPension', req.params.id);
    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error('❌ Read error:', error);
    res.status(404).json({ error: `Pension ${req.params.id} not found` });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// CREATE pension
app.post('/pensions', async (req, res) => {
  let gateway;
  try {
    const { id, recipientName, amount, status } = req.body;
    if (!id || !recipientName || amount === undefined || amount === null || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { contract, gateway: gw } = await getContract();
    gateway = gw;

    const lastUpdated = new Date().toISOString();
    await contract.submitTransaction(
      'CreatePension',
      String(id),
      String(recipientName),
      String(amount),
      String(status),
      lastUpdated
    );
    res.status(201).json({ message: `✅ Pension ${id} created successfully` });
  } catch (error) {
    console.error('❌ Create error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// UPDATE pension
app.put('/pensions/:id', async (req, res) => {
  let gateway;
  try {
    const { recipientName, amount, status } = req.body;
    if (!recipientName || amount === undefined || amount === null || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { contract, gateway: gw } = await getContract();
    gateway = gw;

    const lastUpdated = new Date().toISOString();
    await contract.submitTransaction(
      'UpdatePension',
      String(req.params.id),
      String(recipientName),
      String(amount),
      String(status),
      lastUpdated
    );
    res.json({ message: `✅ Pension ${req.params.id} updated successfully` });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// DELETE pension
app.delete('/pensions/:id', async (req, res) => {
  let gateway;
  try {
    const { contract, gateway: gw } = await getContract();
    gateway = gw;
    await contract.submitTransaction('DeletePension', String(req.params.id));
    res.json({ message: `🗑️ Pension ${req.params.id} deleted successfully` });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// Audit Pension
app.get('/pensions/:id/audit', async (req, res) => {
  let gateway;
  try {
    const { contract, gateway: gw } = await getContract();
    gateway = gw;

    // CORRECTED: The function name must match the chaincode -> 'Audit'
    const result = await contract.evaluateTransaction('Audit', String(req.params.id));

    const auditData = JSON.parse(result.toString());

    // SIMPLIFIED: Return the audit data directly for a cleaner API response
    res.json(auditData);

  } catch (error) {
    console.error(`❌ Audit error for pension ${req.params.id}:`, error);
    // Provide a more specific error message
    if (error.message.includes('does not exist')) {
        return res.status(404).json({ error: `Pension ${req.params.id} not found or has no history.` });
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});


// GET pension history
app.get('/pensions/:id/history', async (req, res) => {
  let gateway;
  try {
    const { contract, gateway: gw } = await getContract();
    gateway = gw;
    const result = await contract.evaluateTransaction('GetPensionHistory', String(req.params.id));
    const history = JSON.parse(result.toString());
    res.json(history);
  } catch (err) {
    console.error('❌ History fetch error:', err);
    res.status(500).send(err.message);
  } finally {
    if (gateway) gateway.disconnect();
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Pension API server running at http://localhost:${PORT}`);
});