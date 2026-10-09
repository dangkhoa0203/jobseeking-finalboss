import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";
import type { Contact, Deal, DealStage, PipelineSummary } from "../api/types";
import { StatsRow } from "../components/StatsRow";
import { PipelineBoard } from "../components/PipelineBoard";
import { NewDealModal } from "../components/NewDealModal";
import styles from "./Dashboard.module.scss";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [dealsData, contactsData, summaryData] = await Promise.all([
        api.listDeals(),
        api.listContacts(),
        api.getSummary(),
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your pipeline.");
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleStageChange(id: number, stage: DealStage) {
    // Optimistic update so the board feels instant; reconciled against the server response.
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)));
    try {
      await api.updateDeal(id, { stage });
      const summaryData = await api.getSummary();
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that deal.");
      loadAll();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await api.deleteDeal(id);
      loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete that deal.");
    }
  }

  function handleCreated() {
    setShowModal(false);
    loadAll();
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.mark}>P</span>
          <span className={styles.word}>Pursuit</span>
        </div>
        <div className={styles.userArea}>
          <span>{user?.displayName}</span>
          <button type="button" className={styles.logout} onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {summary && <StatsRow summary={summary} />}

      <div className={styles.boardHead}>
        <span className={styles.boardTitle}>Pipeline</span>
        <button type="button" className={styles.newDealBtn} onClick={() => setShowModal(true)}>
          + New deal
        </button>
      </div>

      <PipelineBoard deals={deals} onStageChange={handleStageChange} onDelete={handleDelete} />

      {showModal && (
        <NewDealModal contacts={contacts} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
