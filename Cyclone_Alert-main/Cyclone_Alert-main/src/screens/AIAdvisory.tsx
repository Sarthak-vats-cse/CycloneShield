import { useState } from 'react';
import {
  ChevronRight,
  Bot,
  Send,
  Edit3,
  Check,
  Radio,
  X,
  Loader,
  Save,
} from 'lucide-react';
import { RiskBadge, type RiskLevel } from '../components/RiskBadge';

const languages = ['English', 'ଓଡ଼ିଆ', 'हिन्दी', 'বাংলা', 'తెలుగు'];

type AdvisoryResponse = {
  analysis?: string;
  directives?: string[];
  advisory?: string;
  text?: string;
  risk_level?: string;
};

function getRiskLevel(speed: number): RiskLevel {
  if (speed < 40) {
    return 'LOW';
  }

  if (speed < 89) {
    return 'MODERATE';
  }

  if (speed < 118) {
    return 'HIGH';
  }

  return 'CRITICAL';
}

function normalizeRiskLevel(value: unknown): RiskLevel | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.toUpperCase().trim();

  if (
    normalized === 'LOW' ||
    normalized === 'MODERATE' ||
    normalized === 'HIGH' ||
    normalized === 'CRITICAL'
  ) {
    return normalized;
  }

  return null;
}

function cleanText(value: string): string {
  return value
    .replace(/\*\*/g, '')
    .replace(/\[Current Date\]/gi, 'Not provided')
    .replace(/\[Current Time\]/gi, 'Not provided')
    .trim();
}

function parseAdvisoryResponse(
  result: AdvisoryResponse,
): AdvisoryResponse {
  const raw =
    typeof result.advisory === 'string'
      ? result.advisory
      : typeof result.text === 'string'
        ? result.text
        : '';

  if (!raw) {
    return result;
  }

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const nested = JSON.parse(cleaned);

    if (nested && typeof nested === 'object') {
      return nested as AdvisoryResponse;
    }

    return {
      analysis: cleaned,
      directives: [],
    };
  } catch {
    return {
      analysis: cleaned,
      directives: [],
    };
  }
}

export function AIAdvisory() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [lang, setLang] = useState('English');
  const [showModal, setShowModal] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const [analysis, setAnalysis] = useState('');
  const [directives, setDirectives] = useState<string[]>([]);

  const [cyclone, setCyclone] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [location, setLocation] = useState('');

  const [riskLevel, setRiskLevel] =
    useState<RiskLevel>('MODERATE');

  const speed = Number(windSpeed);

  const validSpeed =
    windSpeed.trim() !== '' &&
    Number.isFinite(speed) &&
    speed > 0;

  const handleWindSpeedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setWindSpeed(value);

    const numericSpeed = Number(value);

    if (
      value.trim() !== '' &&
      Number.isFinite(numericSpeed) &&
      numericSpeed > 0
    ) {
      setRiskLevel(getRiskLevel(numericSpeed));
    } else {
      setRiskLevel('MODERATE');
    }
  };

  const handleGenerate = async () => {
    if (
      !cyclone.trim() ||
      !windSpeed.trim() ||
      !location.trim()
    ) {
      setError(
        'Enter the cyclone name, wind speed, and location first.',
      );
      return;
    }

    if (!Number.isFinite(speed) || speed <= 0) {
      setError(
        'Enter a valid wind speed greater than zero.',
      );
      return;
    }

    setLoading(true);
    setError('');
    setGenerated(false);
    setDispatched(false);

    setRiskLevel(getRiskLevel(speed));

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cyclone: cyclone.trim(),
          wind_speed: speed,
          location: location.trim(),
          language: lang,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `Gemini request failed (${response.status}): ${message.slice(
            0,
            300,
          )}`,
        );
      }

      const result =
        (await response.json()) as AdvisoryResponse;

      const parsed = parseAdvisoryResponse(result);

      const nextAnalysis = cleanText(
        typeof parsed.analysis === 'string'
          ? parsed.analysis
          : typeof parsed.advisory === 'string'
            ? parsed.advisory
            : '',
      );

      const nextDirectives = Array.isArray(parsed.directives)
        ? parsed.directives
            .filter(
              (item): item is string =>
                typeof item === 'string' &&
                item.trim().length > 0,
            )
            .map((item) => cleanText(item))
        : [];

      const backendRisk = normalizeRiskLevel(
        parsed.risk_level,
      );

      if (backendRisk) {
        setRiskLevel(backendRisk);
      }

      if (
        !nextAnalysis &&
        nextDirectives.length === 0
      ) {
        throw new Error(
          'The API returned no usable analysis or directives.',
        );
      }

      setAnalysis(nextAnalysis);
      setDirectives(nextDirectives);
      setGenerated(true);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate the advisory.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDirective = (
    index: number,
    value: string,
  ) => {
    setDirectives((previous) =>
      previous.map((item, i) =>
        i === index ? value : item,
      ),
    );
  };

  const addDirective = () => {
    setDirectives((previous) => [
      ...previous,
      '',
    ]);
  };

  const removeDirective = (index: number) => {
    setDirectives((previous) =>
      previous.filter((_, i) => i !== index),
    );
  };

  const handleDispatch = () => {
    setShowModal(false);
    setDispatched(true);
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: 'var(--bg-base)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          className="flex items-center gap-2 text-sm"
          style={{
            color: 'var(--muted)',
          }}
        >
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>
            AI Advisory
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Bot
              size={14}
              style={{ color: 'var(--accent)' }}
            />

            <span
              className="text-xs font-mono-data font-medium"
              style={{
                color: 'var(--accent)',
              }}
            >
              Gemini Analysis Engine
            </span>
          </div>

          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Main panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div
          className="flex flex-col overflow-y-auto p-5 gap-4"
          style={{
            width: generated ? '50%' : '100%',
            borderRight: '1px solid var(--border)',
            transition: 'width 0.4s',
          }}
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot
                size={16}
                style={{ color: 'var(--accent)' }}
              />

              <h2
                className="font-display font-bold text-base tracking-wide"
                style={{
                  color: 'var(--text)',
                }}
              >
                AI IMPACT ANALYSIS
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs font-mono-data"
                style={{
                  color: 'var(--muted)',
                }}
              >
                CYCLONE RISK:
              </span>

              <RiskBadge level={riskLevel} />

              <span
                className="text-xs font-mono-data"
                style={{
                  color: 'var(--muted)',
                }}
              >
                {generated
                  ? 'AI-generated analysis'
                  : 'Awaiting generation'}
              </span>
            </div>
          </div>

          {/* Cyclone input fields */}
          <div
            className="rounded-lg border p-4 flex flex-col gap-3"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <label
              className="text-sm"
              style={{ color: 'var(--text)' }}
            >
              Cyclone name / ID

              <input
                value={cyclone}
                onChange={(event) =>
                  setCyclone(event.target.value)
                }
                placeholder="Enter cyclone name or ID"
                className="mt-1 w-full rounded-md p-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </label>

            <label
              className="text-sm"
              style={{ color: 'var(--text)' }}
            >
              Wind speed (km/h)

              <input
                type="number"
                min="1"
                value={windSpeed}
                onChange={handleWindSpeedChange}
                placeholder="Enter wind speed"
                className="mt-1 w-full rounded-md p-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </label>

            <label
              className="text-sm"
              style={{ color: 'var(--text)' }}
            >
              Location

              <input
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Enter cyclone-affected location"
                className="mt-1 w-full rounded-md p-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </label>
          </div>

          {/* Analysis */}
          <div
            className="rounded-lg border p-4"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            {editing ? (
              <textarea
                value={analysis}
                onChange={(event) =>
                  setAnalysis(event.target.value)
                }
                placeholder="Edit the generated analysis here..."
                className="w-full min-h-64 resize-y rounded-md p-3 text-sm leading-relaxed outline-none"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--text)',
                  border: '1px solid var(--accent)',
                }}
              />
            ) : (
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  color: 'var(--text)',
                }}
              >
                {analysis || (
                  <p
                    style={{
                      color: 'var(--muted)',
                    }}
                  >
                    No analysis generated yet. Enter cyclone
                    details and click Generate Emergency Advisory.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-lg border p-4 text-sm"
              style={{
                color: '#EF4444',
                borderColor: '#EF4444',
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              {error}
            </div>
          )}

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'var(--accent)',
              color: '#07111F',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Loader
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}

            {loading
              ? 'Generating advisory...'
              : generated
                ? 'Regenerate Emergency Advisory'
                : 'Generate Emergency Advisory'}
          </button>
        </div>

        {/* Right panel */}
        {generated && (
          <div
            className="flex flex-col overflow-y-auto p-5 gap-4"
            style={{
              width: '50%',
            }}
          >
            {/* Right header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio
                  size={16}
                  style={{
                    color: '#F97316',
                  }}
                />

                <h2
                  className="font-display font-bold text-base tracking-wide"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  AI-GENERATED ADVISORY
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <RiskBadge level={riskLevel} />

                <span
                  className="text-xs font-mono-data"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  Generated by Gemini
                </span>
              </div>
            </div>

            {/* Directives */}
            <div
              className="rounded-lg border p-4 flex-1"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="text-xs font-mono-data font-medium mb-3 tracking-widest"
                style={{
                  color: 'var(--muted)',
                }}
              >
                EMERGENCY ACTION DIRECTIVES
              </div>

              {directives.length === 0 ? (
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  No separate directives were returned. See the
                  analysis panel.
                </p>
              ) : (
                <ol className="space-y-3">
                  {directives.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-mono-data font-bold mt-1"
                        style={{
                          background:
                            'rgba(239,68,68,0.15)',
                          color: '#EF4444',
                        }}
                      >
                        {index + 1}
                      </span>

                      {editing ? (
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea
                            value={item}
                            onChange={(event) =>
                              updateDirective(
                                index,
                                event.target.value,
                              )
                            }
                            placeholder="Edit this directive..."
                            className="w-full min-h-24 resize-y rounded-md p-3 text-sm leading-snug outline-none"
                            style={{
                              background:
                                'var(--bg-base)',
                              color: 'var(--text)',
                              border:
                                '1px solid var(--accent)',
                            }}
                          />

                          <button
                            onClick={() =>
                              removeDirective(index)
                            }
                            className="self-start text-xs px-3 py-1 rounded"
                            style={{
                              color: '#EF4444',
                              border:
                                '1px solid rgba(239,68,68,0.3)',
                            }}
                          >
                            Remove directive
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-sm leading-snug"
                          style={{
                            color: 'var(--text)',
                          }}
                        >
                          {item}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {editing && (
                <button
                  onClick={addDirective}
                  className="mt-4 px-3 py-2 rounded text-sm"
                  style={{
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                  }}
                >
                  + Add directive
                </button>
              )}
            </div>

            {/* Language */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs"
                style={{
                  color: 'var(--muted)',
                }}
              >
                Language:
              </span>

              <div className="flex gap-1.5 flex-wrap">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => setLang(language)}
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      background:
                        lang === language
                          ? 'rgba(56,189,248,0.15)'
                          : 'var(--bg-card)',
                      color:
                        lang === language
                          ? 'var(--accent)'
                          : 'var(--muted)',
                      border: `1px solid ${
                        lang === language
                          ? 'rgba(56,189,248,0.3)'
                          : 'var(--border)'
                      }`,
                    }}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {!dispatched ? (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setEditing((previous) => !previous)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--muted)',
                    border:
                      '1px solid var(--border)',
                  }}
                >
                  {editing ? (
                    <>
                      <Save size={14} />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit3 size={14} />
                      Edit
                    </>
                  )}
                </button>

                {editing && (
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium"
                    style={{
                      background:
                        'rgba(34,197,94,0.1)',
                      color: '#22C55E',
                      border:
                        '1px solid rgba(34,197,94,0.3)',
                    }}
                  >
                    <Check size={14} />
                    Done
                  </button>
                )}

                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded text-sm font-bold"
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                  }}
                >
                  <Radio size={14} />
                  Dispatch
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg"
                style={{
                  background:
                    'rgba(34,197,94,0.1)',
                  border:
                    '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <Check
                  size={16}
                  style={{
                    color: '#22C55E',
                  }}
                />

                <span
                  className="text-sm font-medium"
                  style={{
                    color: '#22C55E',
                  }}
                >
                  Demo dispatch marked as complete.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dispatch modal */}
      {showModal && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(7,17,31,0.85)',
          }}
        >
          <div
            className="rounded-xl border p-6 w-96 shadow-2xl"
            style={{
              background: 'var(--bg-surface)',
              borderColor: '#EF4444',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  className="font-display font-bold text-base"
                  style={{
                    color: '#EF4444',
                  }}
                >
                  Confirm Demo Dispatch
                </h3>

                <p
                  className="text-xs mt-1"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  This only changes the demo interface. No real
                  alert will be sent.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
              >
                <X
                  size={16}
                  style={{
                    color: 'var(--muted)',
                  }}
                />
              </button>
            </div>

            <p
              className="text-sm mb-5"
              style={{
                color: 'var(--text)',
              }}
            >
              Confirm that you want to mark this advisory as
              dispatched in the demo.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded text-sm"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--muted)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDispatch}
                className="flex-1 py-2 rounded text-sm font-bold"
                style={{
                  background: '#EF4444',
                  color: '#fff',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}