import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = "/api/inventory/";

function App() {
  const [items, setItems] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [timeLeft, setTimeLeft] = useState(3600);

  const defaultItems = [
    { id: 1, sku: "SKU-3311", item_name: "Steel Bolts (M6)", quantity: 42, threshold: 50, target_stock: 200 },
    { id: 2, sku: "SKU-4456", item_name: "Cardboard Boxes (L)", quantity: 9, threshold: 30, target_stock: 150 },
    { id: 3, sku: "SKU-5502", item_name: "Bubble Wrap Roll", quantity: 130, threshold: 40, target_stock: 100 },
    { id: 4, sku: "SKU-6120", item_name: "Adhesive Labels", quantity: 15, threshold: 20, target_stock: 100 },
    { id: 5, sku: "SKU-1042", item_name: "Cotton Fabric Roll", quantity: 18, threshold: 20, target_stock: 100 },
    { id: 6, sku: "SKU-2087", item_name: "Packing Tape", quantity: 240, threshold: 50, target_stock: 200 },
  ];

  // Wrapped in useCallback to safely include in useEffect dependency array
  const fetchInventory = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      const data = Array.isArray(response.data) && response.data.length > 0 ? response.data : defaultItems;
      setItems(data);
    } catch (error) {
      setItems(defaultItems);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const currentList = items.length > 0 ? items : defaultItems;
    setDisplayItems(currentList.slice(0, 4));

    const shuffleInterval = setInterval(() => {
      setItems((prevItems) => {
        const sourceList = prevItems.length > 0 ? prevItems : defaultItems;
        const rotated = [...sourceList.slice(1), sourceList[0]];
        setDisplayItems(rotated.slice(0, 4));
        return rotated;
      });
    }, 3000);

    return () => clearInterval(shuffleInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a CSV file first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_URL}upload_csv/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("CSV uploaded successfully!");
      fetchInventory();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        .item-row-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .item-row-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
          border-color: #cbd5e1 !important;
        }
        .metric-card-hover {
          transition: all 0.25s ease;
        }
        .metric-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Prominent Header with Large Centered Title */}
      <div style={styles.topHeader}>
        {/* Invisible Spacer for perfect alignment */}
        <div style={styles.headerSpacer}></div>

        {/* Large Centered Title Group */}
        <div style={styles.centeredTitleGroup}>
          <div style={styles.brandBadge}>
            <div style={styles.logoBadge}>📦</div>
            <h1 style={styles.companyName}>Inventory Reorder Alert System</h1>
          </div>
          <div style={styles.portalSubtext}>Real-time Supply Chain Automation Engine</div>
        </div>

        {/* Right Timer Badge */}
        <div style={styles.timerBadge}>
          <span style={{ ...styles.timerDot, animation: "pulseDot 1.5s infinite" }}>●</span> 
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Metrics Overview Row */}
        <div style={styles.metricsRow}>
          <div className="metric-card-hover" style={styles.metricCard}>
            <span style={styles.metricLabel}>SYSTEM STATUS</span>
            <span style={styles.metricValue}>
              <span style={{ color: "#16a34a", marginRight: "6px" }}>●</span>Active Scan
            </span>
          </div>
          <div className="metric-card-hover" style={styles.metricCard}>
            <span style={styles.metricLabel}>SCAN FREQUENCY</span>
            <span style={styles.metricValue}>Every 3s</span>
          </div>
          <div className="metric-card-hover" style={styles.metricCard}>
            <span style={styles.metricLabel}>DATA CONNECTOR</span>
            <span style={styles.metricValue}>CSV / REST API</span>
          </div>
          <div className="metric-card-hover" style={styles.metricCard}>
            <span style={styles.metricLabel}>OPERATIONAL MODE</span>
            <span style={styles.metricValue}>Automated</span>
          </div>
        </div>

        {/* Upload Action Controls */}
        <div style={styles.uploadRow}>
          <form onSubmit={handleFileUpload} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={styles.customFileBtn}>
              Choose File
              <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
            <span style={styles.fileNameText}>{fileName}</span>
            <button type="submit" style={styles.uploadBtn}>Upload CSV</button>
          </form>

          <div style={styles.liveIndicatorBadge}>
            <span style={{ ...styles.liveDot, animation: "pulseDot 1.5s infinite" }}>●</span> 
            Live Auto-Scan Active
          </div>
        </div>

        {/* Live Stock Scan Preview Box */}
        <div style={styles.cardContainer}>
          <div style={styles.cardHeaderRow}>
            <h3 style={styles.cardTitle}>Live Stock Scan Preview</h3>
            <span style={styles.showingBadge}>Displaying 4 of {items.length || defaultItems.length} inventory items</span>
          </div>

          <div style={styles.itemsList}>
            {displayItems.map((item) => {
              const isReorder = item.quantity <= item.threshold;
              const deficit = (item.target_stock || 100) - item.quantity;

              return (
                <div key={item.sku} className="item-row-card" style={styles.itemRow}>
                  <div style={styles.itemMeta}>
                    <span style={styles.skuText}>{item.sku}</span>
                    <span style={styles.dot}>·</span>
                    <span style={styles.nameText}>{item.item_name}</span>
                  </div>

                  <div style={styles.qtyContainer}>
                    <span style={styles.qtyLabel}>Qty:</span>
                    <span style={styles.qtyVal}>{item.quantity}</span>
                  </div>

                  <div style={styles.statusGroup}>
                    {isReorder && (
                      <span style={styles.deficitText}>+{deficit} units needed</span>
                    )}
                    <div style={isReorder ? styles.badgeReorder : styles.badgeInStock}>
                      {isReorder ? "REORDER" : "IN STOCK"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footerText}>
          Inventory Reorder Alert System — Warehouse Automation Dashboard
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: "#f4f7fb",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    paddingBottom: "50px",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 50px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.03)",
  },
  headerSpacer: {
    width: "120px",
  },
  centeredTitleGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  brandBadge: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
  },
  companyName: {
    margin: 0,
    fontWeight: "900",
    color: "#0f172a",
    fontSize: "28px",
    letterSpacing: "-0.8px",
    lineHeight: "1.1",
  },
  portalSubtext: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    letterSpacing: "-0.1px",
  },
  timerBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "8px 20px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "monospace",
    border: "1px solid #dbeafe",
  },
  timerDot: {
    color: "#2563eb",
    fontSize: "10px",
  },
  contentWrapper: {
    maxWidth: "740px",
    margin: "35px auto 0 auto",
    padding: "0 20px",
  },
  metricsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metricLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  metricValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: "700",
  },
  uploadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  customFileBtn: {
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  fileNameText: {
    fontSize: "12px",
    color: "#64748b",
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  uploadBtn: {
    padding: "8px 18px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
  },
  liveIndicatorBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#15803d",
    fontWeight: "600",
    backgroundColor: "#f0fdf4",
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #dcfce7",
  },
  liveDot: {
    color: "#16a34a",
    fontSize: "10px",
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "26px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    fontWeight: "700",
  },
  showingBadge: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemRow: {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #f1f5f9",
  },
  itemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 2,
  },
  skuText: {
    fontWeight: "700",
    color: "#334155",
    fontSize: "13px",
    fontFamily: "monospace",
  },
  dot: {
    color: "#cbd5e1",
  },
  nameText: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "13px",
  },
  qtyContainer: {
    flex: 1,
    display: "flex",
    gap: "4px",
    justifyContent: "center",
  },
  qtyLabel: {
    color: "#94a3b8",
    fontSize: "13px",
  },
  qtyVal: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: "13px",
  },
  statusGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  deficitText: {
    fontSize: "11px",
    color: "#dc2626",
    fontWeight: "600",
  },
  badgeInStock: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  badgeReorder: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  footerText: {
    marginTop: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
  }
};

export default App;