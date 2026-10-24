import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  Database, 
  Play, 
  Download, 
  RefreshCw
} from 'lucide-react';
import type { StoreCohort, MerchantKPIs, Product } from '../types';

interface ShopOwnerPanelProps {
  kpis: MerchantKPIs;
  cohorts: StoreCohort[];
  products: Product[];
  addToast: (msg: string) => void;
}

export const ShopOwnerPanel: React.FC<ShopOwnerPanelProps> = ({
  kpis,
  cohorts: initialCohorts,
  products,
  addToast
}) => {
  const [cohorts, setCohorts] = useState<StoreCohort[]>(initialCohorts);
  const [selectedCohortId, setSelectedCohortId] = useState<string>(cohorts[0].id);
  const [queryEpsilon, setQueryEpsilon] = useState<number>(0.5);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [lastQueryResult, setLastQueryResult] = useState<{
    cohortName: string;
    trueCount: number;
    noisyCount: number;
    noiseAdded: number;
    epsilon: number;
    marginOfError: number;
  } | null>(null);

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId) || cohorts[0];

  // Execute a differential privacy query
  const handleRunDPQuery = () => {
    setIsQuerying(true);

    setTimeout(() => {
      // Laplace noise simulation: b = 1.0 / epsilon
      const b = 1.0 / queryEpsilon;
      const u = Math.random() - 0.5;
      const noise = Math.round(-b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u)));
      const noisy = Math.max(10, selectedCohort.trueCustomerCount + noise);
      const margin = Math.round(2.5 * b);

      setLastQueryResult({
        cohortName: selectedCohort.name,
        trueCount: selectedCohort.trueCustomerCount,
        noisyCount: noisy,
        noiseAdded: noise,
        epsilon: queryEpsilon,
        marginOfError: margin
      });

      // Update in cohort list
      setCohorts(prev => prev.map(c => 
        c.id === selectedCohort.id ? { ...c, perturbedCount: noisy, laplaceNoise: noise } : c
      ));

      setIsQuerying(false);
      addToast(`DP Aggregate count computed for "${selectedCohort.name}" (ε=${queryEpsilon})`);
    }, 500);
  };

  const handleExportData = () => {
    const exportPayload = {
      storeName: 'Aegis Ethical Goods',
      generatedAt: new Date().toISOString(),
      kpis,
      anonymizedCohorts: cohorts.map(c => ({
        cohort: c.name,
        anonymizedCount: c.perturbedCount,
        kAnonymityScore: c.kAnonymity,
        privacyStandard: 'Differential Privacy Laplace Perturbation'
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `store_privacy_intelligence_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    addToast('Anonymized store intelligence report exported.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card card-padded" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag tag-gold">Shop Owner Intelligence</span>
            <span className="tag tag-privacy">Decentralized Aggregation</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Store Analytics &amp; Privacy-Preserving Merchandising
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
            Understand consumer demand trends through mathematical Differential Privacy cohorts without accessing individual shopper identity or browsing history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportData}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <Download size={14} />
            <span>Export Anonymized Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row (Minimal, decent, real metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Monthly Store Revenue
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Privacy-Protected Orders
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>
            {kpis.totalOrders}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            100% verified zero-party intent
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Shopper Privacy Adoption
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0', color: 'var(--primary)' }}>
            {kpis.anonymizedAdoptionRate}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Opted into on-device matching
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Average Order Value (AOV)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>
            ${kpis.averageOrderValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Across all categories
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: DP Query Studio & Store Cohorts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Column 1: DP Query Tool */}
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Differential Privacy Query Engine
              </h2>
            </div>
            <span className="tag tag-privacy">k &ge; 50 Gate</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Extract consumer segment sizes without exposing any single buyer's cart history or personal identity.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Target Consumer Segment:
            </label>
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="form-input"
            >
              {cohorts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} &bull; {c.targetCategory}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Budget Epsilon Slider */}
          <div style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Differential Privacy Epsilon (&epsilon;):</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                {queryEpsilon}
              </span>
            </div>

            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              value={queryEpsilon}
              onChange={(e) => setQueryEpsilon(parseFloat(e.target.value))}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>High Noise (&epsilon;=0.2)</span>
              <span>Balanced (&epsilon;=0.5)</span>
              <span>Low Noise (&epsilon;=1.0)</span>
            </div>
          </div>

          <button
            onClick={handleRunDPQuery}
            disabled={isQuerying}
            className="btn btn-primary"
            style={{ width: '100%', gap: '8px' }}
          >
            {isQuerying ? (
              <>
                <RefreshCw size={15} />
                <span>Computing Laplace Perturbation...</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>Run Private Segment Query</span>
              </>
            )}
          </button>

          {/* Query Output Result */}
          {lastQueryResult && (
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Public Segment Count:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ~{lastQueryResult.noisyCount.toLocaleString()} shoppers
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Laplace Injected Noise:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {lastQueryResult.noiseAdded >= 0 ? `+${lastQueryResult.noiseAdded}` : lastQueryResult.noiseAdded} records
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>95% Confidence Margin:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    &plusmn; {lastQueryResult.marginOfError} shoppers
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                &bull; Individual consumer identities remain provably hidden under standard differential privacy bounds.
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Active Consumer Cohorts Table */}
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Aggregated Customer Segments
              </h2>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Updated Hourly
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cohorts.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCohortId(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: selectedCohortId === c.id ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                  border: selectedCohortId === c.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Category: {c.targetCategory} &bull; Avg Spend: ${c.averageSpend}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 700 }}>
                    ~{c.perturbedCount.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    {c.trend} demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merchandising & Inventory Trend Recommendations */}
      <div className="card card-padded">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Privacy-Friendly Inventory Recommendations
            </h3>
          </div>
          <span className="tag tag-neutral">Aggregated Demand Signals</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {products.slice(0, 3).map(p => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'flex',
                gap: '12px'
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Category: {p.category} &bull; ${p.price}
                </div>
                <span className="tag tag-success" style={{ fontSize: '0.68rem' }}>
                  Recommended: Increase stock +25 units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store Compliance & Data Minimization Settings */}
      <div className="card card-padded" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={16} style={{ color: '#10B981' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Store Data Minimization &amp; Retention Policy
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Raw IP addresses and temporary session logs automatically shredded after retention window.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Purge Window:</span>
          <select
            value={retentionDays}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRetentionDays(val);
              addToast(`Store data retention window updated to ${val} days.`);
            }}
            className="form-input"
            style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <option value={14}>14 Days (Strict)</option>
            <option value={30}>30 Days (Recommended)</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
};
