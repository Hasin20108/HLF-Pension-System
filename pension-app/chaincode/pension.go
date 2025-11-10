package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a pension record
type SmartContract struct {
	contractapi.Contract
}

// Pension describes basic details of a pension record
type Pension struct {
	ID            string  `json:"id"`
	RecipientName string  `json:"recipientName"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
	LastUpdated   string  `json:"lastUpdated"` // ISO 8601 format string
}

// HistoryQueryResult structure used for returning history records
type HistoryQueryResult struct {
	TxId      string    `json:"txId"`
	Timestamp time.Time `json:"timestamp"`
	IsDelete  bool      `json:"isDelete"`
	Value     *Pension  `json:"value"`
}

// AuditEntry contains hashes for each historical modification of a key.
type AuditEntry struct {
	TxId      string     `json:"txId"`
	Timestamp time.Time  `json:"timestamp"`
	IsDelete  bool       `json:"isDelete"`
	Value     *Pension   `json:"value,omitempty"`
	ValueHash string     `json:"valueHash"`  // sha256(JSON(value)) or empty if IsDelete
	EntryHash string     `json:"entryHash"`  // sha256(TxId | Timestamp | IsDelete | ValueHash)
	ChainHash string     `json:"chainHash"`  // rolling sha256(prevChainHash || EntryHash)
}

// AuditResult bundles all audit entries and the final rolling hash.
type AuditResult struct {
	Entries        []AuditEntry `json:"entries"`
	FinalChainHash string       `json:"finalChainHash"`
}

// InitLedger adds a base set of pensions to the ledger
// Uses the transaction timestamp (deterministic across endorsers) for LastUpdated.
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("failed to get tx timestamp: %w", err)
	}
	isoNow := ts.AsTime().UTC().Format(time.RFC3339)

	pensions := []Pension{
		{ID: "PENSION_001", RecipientName: "Abul Kalam", Amount: 15000.50, Status: "Active", LastUpdated: isoNow},
		{ID: "PENSION_002", RecipientName: "Fatima Begum", Amount: 12500.00, Status: "Retired", LastUpdated: isoNow},
	}

	for _, pension := range pensions {
		pensionJSON, err := json.Marshal(pension)
		if err != nil {
			return err
		}

		if err := ctx.GetStub().PutState(pension.ID, pensionJSON); err != nil {
			return fmt.Errorf("failed to put to world state: %w", err)
		}
	}

	return nil
}

// CreatePension issues a new pension to the world state with given details.
// Accepts 'lastUpdated' from the client to ensure consistency with off-chain time sources.
func (s *SmartContract) CreatePension(ctx contractapi.TransactionContextInterface, id string, recipientName string, amount float64, status string, lastUpdated string) error {
	exists, err := s.PensionExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the pension %s already exists", id)
	}

	pension := Pension{
		ID:            id,
		RecipientName: recipientName,
		Amount:        amount,
		Status:        status,
		LastUpdated:   lastUpdated,
	}
	pensionJSON, err := json.Marshal(pension)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, pensionJSON)
}

// ReadPension returns the pension stored in the world state with given id.
func (s *SmartContract) ReadPension(ctx contractapi.TransactionContextInterface, id string) (*Pension, error) {
	pensionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if pensionJSON == nil {
		return nil, fmt.Errorf("the pension %s does not exist", id)
	}

	var pension Pension
	if err := json.Unmarshal(pensionJSON, &pension); err != nil {
		return nil, err
	}
	return &pension, nil
}

// UpdatePension updates an existing pension in the world state with provided parameters.
// Accepts 'lastUpdated' from the client to ensure consistency with off-chain time sources.
func (s *SmartContract) UpdatePension(ctx contractapi.TransactionContextInterface, id string, recipientName string, amount float64, status string, lastUpdated string) error {
	exists, err := s.PensionExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the pension %s does not exist", id)
	}

	pension := Pension{
		ID:            id,
		RecipientName: recipientName,
		Amount:        amount,
		Status:        status,
		LastUpdated:   lastUpdated,
	}
	pensionJSON, err := json.Marshal(pension)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, pensionJSON)
}

// DeletePension deletes a given pension from the world state.
func (s *SmartContract) DeletePension(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := s.PensionExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the pension %s does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}

// PensionExists returns true when pension with given ID exists in world state
func (s *SmartContract) PensionExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	pensionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return pensionJSON != nil, nil
}

// GetAllPensions returns all pensions found in world state
func (s *SmartContract) GetAllPensions(ctx contractapi.TransactionContextInterface) ([]*Pension, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var pensions []*Pension
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var pension Pension
		if err := json.Unmarshal(queryResponse.Value, &pension); err != nil {
			return nil, err
		}
		pensions = append(pensions, &pension)
	}

	return pensions, nil
}

// GetPensionHistory returns the chain of custody for a pension since issuance.
func (s *SmartContract) GetPensionHistory(ctx contractapi.TransactionContextInterface, pensionID string) ([]HistoryQueryResult, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(pensionID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryQueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var pension Pension
		var record HistoryQueryResult

		record.TxId = response.TxId
		record.Timestamp = response.Timestamp.AsTime()
		record.IsDelete = response.IsDelete

		if !response.IsDelete {
			if err := json.Unmarshal(response.Value, &pension); err != nil {
				return nil, err
			}
			record.Value = &pension
		}
		records = append(records, record)
	}
	return records, nil
}

// Audit recomputes hashes over the full history of a pension key and returns
// tamper-evident hashes for each entry plus a rolling chain hash.
// It performs no writes and can be added with minimal modification.
func (s *SmartContract) Audit(ctx contractapi.TransactionContextInterface, pensionID string) (*AuditResult, error) {
	iter, err := ctx.GetStub().GetHistoryForKey(pensionID)
	if err != nil {
		return nil, fmt.Errorf("history error for %s: %w", pensionID, err)
	}
	defer iter.Close()

	var (
		entries   []AuditEntry
		prevChain [32]byte // zero-initialized for first record
	)

	for iter.HasNext() {
		hist, err := iter.Next()
		if err != nil {
			return nil, fmt.Errorf("history iteration error: %w", err)
		}

		entry := AuditEntry{
			TxId:      hist.TxId,
			Timestamp: hist.Timestamp.AsTime(),
			IsDelete:  hist.IsDelete,
		}

		// If not a delete, unmarshal & compute ValueHash over canonical JSON
		if !hist.IsDelete && len(hist.Value) > 0 {
			var p Pension
			if err := json.Unmarshal(hist.Value, &p); err != nil {
				return nil, fmt.Errorf("unmarshal value at tx %s: %w", hist.TxId, err)
			}
			entry.Value = &p

			valueJSON, err := json.Marshal(p) // canonicalize
			if err != nil {
				return nil, fmt.Errorf("marshal canonical value at tx %s: %w", hist.TxId, err)
			}
			vh := sha256.Sum256(valueJSON)
			entry.ValueHash = hex.EncodeToString(vh[:])
		} else {
			entry.ValueHash = "" // deletes have no value
		}

		// Canonical timestamp string for hashing
		ts := entry.Timestamp.UTC().Format(time.RFC3339Nano)

		// Build canonical payload for entry hash
		// Format: TxId | \n | Timestamp | \n | IsDelete(true/false) | \n | ValueHash | \n
		payload := []byte(entry.TxId + "\n" + ts + "\n" + fmt.Sprintf("%t", entry.IsDelete) + "\n" + entry.ValueHash + "\n")

		// Compute EntryHash
		eh := sha256.Sum256(payload)
		entry.EntryHash = hex.EncodeToString(eh[:])

		// Compute rolling ChainHash = sha256(prevChainHash || EntryHashBytes)
		ehBytes := eh[:] // 32 bytes
		chainInput := make([]byte, 0, len(prevChain)+len(ehBytes))
		chainInput = append(chainInput, prevChain[:]...)
		chainInput = append(chainInput, ehBytes...)

		ch := sha256.Sum256(chainInput)
		entry.ChainHash = hex.EncodeToString(ch[:])

		// Advance rolling hash
		prevChain = ch

		entries = append(entries, entry)
	}

	result := &AuditResult{
		Entries:        entries,
		FinalChainHash: hex.EncodeToString(prevChain[:]),
	}
	return result, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating pension chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting pension chaincode: %v", err)
	}
}