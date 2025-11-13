# Tamper-Proof and Auto-Auditable Pension Management System using Hyperledger Fabric

**Pension-App** is a blockchain-based pension management system built on **Hyperledger Fabric**.
It ensures **trust, transparency, and accountability** in pension disbursement by leveraging the **immutable ledger** and **permissioned network** of Fabric.

The system automates pension processing, prevents fraud, and provides **auto-auditable** transaction records — a modern approach to secure financial governance.

---

## 🌟 Features

* 🔒 **Immutable Ledger:** Every pension transaction is securely recorded on the blockchain.
* 🏛️ **Multi-Organization Network:** Includes Government, Bank, and Auditor organizations.
* ⚙️ **Smart Contract (Chaincode):** Automates pension approval and disbursement processes.
* 📑 **Auto-Audit Trails:** Each transaction is logged for transparency and verification.
* 👤 **Identity-Based Access Control:** Managed using Fabric CA.
* 📈 **Dashboard for Pensioners & Admins:** View, approve, and track pension disbursements.
* 🧠 **Error Recovery & Transaction Validation:** Built-in endorsement and ordering mechanisms.
* 🔗 **Fabric SDK Integration:** Backend built using Node.js SDK for network communication.

---

## 🏗️ Tech Stack

| **Component**              | **Technology Used**                   |
| -------------------------- | ------------------------------------- |
| Blockchain Framework       | Hyperledger Fabric v2.5               |
| Smart Contract (Chaincode) | Go                          |
| Backend (API Layer)        | Express.js with Fabric SDK               |
| Frontend (Dashboard)       | React.js and Tailwind CSS   |
| Network Setup              | Docker Compose / Kubernetes           |
| Certificate Authority      | Fabric CA                             |
| Channel Configuration      | `configtx.yaml`, `crypto-config.yaml` |
| Authentication             | Fabric MSP & Wallet System            |

---
## System Architecture

<!-- 
## 📁 Project Structure

```
HLF-Pension-System
  └── blockchain-network
      │   ├── bin/
      │   ├── builders/ 
      │   ├── ci/
      │   ├── config/
      │   ├── test-network/
      pension-app
      │   ├── backend/
      │   ├── chaincode/
      │   ├── frontend/
      │   ├── package-lock.json
      README.md
      .gitignore
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/pension-system.git
cd pension-system
```

### 2️⃣ Start the Fabric Network

```bash
cd blockchain
./network.sh up createChannel -ca
./network.sh deployCC -ccn pension -ccp ../chaincode/ -ccl node
```

### 3️⃣ Enroll Admin and Register Users

```bash
cd backend
node enrollAdmin.js
node registerUser.js
```

### 4️⃣ Run the Backend API

```bash
node server.js
```

### 5️⃣ Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Your system should now be live at:
📍 **[http://localhost:3000](http://localhost:3000)**

---

## 🧠 System Flow

1. Pensioners register and submit claims.
2. Government officials verify and approve requests.
3. Bank organization disburses pension funds.
4. All actions are recorded immutably in the ledger.
5. Auditor organization can view and verify all transactions.

---

## 📸 Screenshots (Optional)

<p align="center">
  <img src="https://github.com/user-attachments/assets/example1.png" width="400" />
  <img src="https://github.com/user-attachments/assets/example2.png" width="400" />
</p>

---

## 🧱 Architecture Diagram

<img width="800" alt="architecture" src="https://github.com/user-attachments/assets/example-architecture.png" />

---

## 🔒 Security Highlights

* MSP-based access control for each organization
* Encrypted identity and key storage in wallet
* Channel-based data privacy
* Audit-ready immutable records
* Private data collections (optional)

---

## 🧩 Future Enhancements

* Integration with national pension databases
* Support for biometric identity verification
* Analytics dashboard using Hyperledger Explorer
* Role-based web portal for each organization
* Integration with government payment APIs

---

## 🧪 Testing

Run basic Fabric tests and chaincode unit tests:

```bash
npm test
```

---

## 🚀 Deployment

For production or government use cases, deploy on **Kubernetes** with persistent storage:

```bash
kubectl apply -f k8s/
```

You can also integrate **Fabric Operations Console** for network monitoring.

---

## 🤝 Contributors

| Name               | Role                     | Contribution                           |
| ------------------ | ------------------------ | -------------------------------------- |
| Md. Bakhtiar Hasin | Lead Developer           | Network setup, backend SDK integration |
| [Add more]         | Smart contract developer | Chaincode logic & endorsement policy   |
| [Add more]         | UI Developer             | Frontend dashboard (Next.js)           |

---

## 📜 License

This project is licensed under the [Apache 2.0 License](LICENSE).

---

## 📞 Contact

**Md. Bakhtiar Hasin**
🎓 CSE Student | Blockchain Developer
📧 [[your.email@example.com](mailto:your.email@example.com)]
🌐 [your-portfolio-link]

---

Would you like me to **add a system flow diagram (SVG or PNG)** and a **sample architecture image** (with Orderer, Acme, and Bank orgs) that fits this README perfectly? I can generate one for you visually. -->
