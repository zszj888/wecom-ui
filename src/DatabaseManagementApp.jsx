import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Database, Play, Table, RefreshCcw, Users, Building2,
    Settings, ChevronDown, ChevronUp, History, Star,
    Search, Clock, Copy, Trash2, Zap, Shield, Activity,
    Server, Terminal, Eye, Code, Layers,
    Building, User, ChevronRight, FolderTree, Download,
    PanelLeftOpen, PanelLeftClose
} from 'lucide-react';
import Split from 'react-split';

// ============================================================
// DESIGN SYSTEM - "Midnight Terminal" Aesthetic
// Bold dark theme with neon amber/slate contrast
// ============================================================

const DESIGN_SYSTEM = {
    colors: {
        bg: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
            elevated: '#ffffff',
            surface: '#e2e8f0',
        },
        accent: {
            primary: '#f59e0b',      // Amber - warm, distinctive
            secondary: '#3b82f6',    // Blue - information
            success: '#10b981',      // Green - status
            danger: '#ef4444',       // Red - error/delete
            muted: '#94a3b8',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#94a3b8',
            inverse: '#ffffff',
        },
        border: {
            subtle: '#e2e8f0',
            medium: '#cbd5e1',
            accent: 'rgba(245, 158, 11, 0.3)',
        },
        glass: {
            light: 'rgba(0, 0, 0, 0.02)',
            medium: 'rgba(0, 0, 0, 0.04)',
            heavy: 'rgba(0, 0, 0, 0.06)',
        },
    },
    fonts: {
        display: "'Space Grotesk', 'SF Pro Display', -apple-system, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    shadows: {
        glow: '0 0 40px rgba(245, 158, 11, 0.15)',
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
    animations: {
        shimmer: `linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.1) 50%, transparent 100%)`,
    },
};

// ============================================================
// STYLES - CSS-in-JS for the distinctive aesthetic
// ============================================================

const styles = {
    container: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.primary,
        color: DESIGN_SYSTEM.colors.text.primary,
        fontFamily: DESIGN_SYSTEM.fonts.body,
        minHeight: '100vh',
    },
    sidebar: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.secondary,
        borderRight: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
    },
    sidebarHeader: {
        background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.bg.tertiary} 0%, ${DESIGN_SYSTEM.colors.bg.secondary} 100%)`,
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
    },
    dbNode: {
        backgroundColor: DESIGN_SYSTEM.colors.glass.light,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
    },
    tableButton: {
        transition: 'all 0.2s ease',
    },
    mainPanel: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.primary,
    },
    card: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.secondary,
        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        boxShadow: DESIGN_SYSTEM.shadows.card,
    },
    cardHeader: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
    },
    input: {
        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        color: DESIGN_SYSTEM.colors.text.primary,
        fontFamily: DESIGN_SYSTEM.fonts.mono,
    },
    button: {
        primary: {
            backgroundColor: DESIGN_SYSTEM.colors.accent.primary,
            color: DESIGN_SYSTEM.colors.text.inverse,
            fontWeight: 600,
        },
        secondary: {
            backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
            border: `1px solid ${DESIGN_SYSTEM.colors.border.medium}`,
            color: DESIGN_SYSTEM.colors.text.primary,
        },
        danger: {
            backgroundColor: 'transparent',
            color: DESIGN_SYSTEM.colors.accent.danger,
            border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}`,
        },
    },
    tab: {
        active: {
            color: DESIGN_SYSTEM.colors.accent.primary,
            borderBottom: `2px solid ${DESIGN_SYSTEM.colors.accent.primary}`,
        },
        inactive: {
            color: DESIGN_SYSTEM.colors.text.muted,
        },
    },
    glowText: {
        color: DESIGN_SYSTEM.colors.accent.primary,
        textShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
    },
};

// ============================================================
// COMPONENTS
// ============================================================

// Neon Badge Component
const NeonBadge = ({ children, variant = 'primary', size = 'sm' }) => {
    const colorMap = {
        primary: DESIGN_SYSTEM.colors.accent.primary,
        success: DESIGN_SYSTEM.colors.accent.success,
        danger: DESIGN_SYSTEM.colors.accent.danger,
        secondary: DESIGN_SYSTEM.colors.accent.secondary,
    };

    const sizeMap = {
        sm: { padding: '2px 8px', fontSize: '10px' },
        md: { padding: '4px 12px', fontSize: '12px' },
    };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: sizeMap[size].padding,
            fontSize: sizeMap[size].fontSize,
            fontWeight: 600,
            fontFamily: DESIGN_SYSTEM.fonts.mono,
            backgroundColor: `${colorMap[variant]}15`,
            color: colorMap[variant],
            border: `1px solid ${colorMap[variant]}30`,
            borderRadius: '4px',
            letterSpacing: '0.5px',
        }}>
            {children}
        </span>
    );
};

// Environment Badge Component
const EnvironmentBadge = () => {
    const isQA = import.meta.env.VITE_API_BASE?.includes('qa-kip-service-internal.kerryplus.com');
    const envName = isQA ? 'QA' : 'PROD';
    const envColor = isQA ? DESIGN_SYSTEM.colors.accent.primary : DESIGN_SYSTEM.colors.accent.success;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: DESIGN_SYSTEM.fonts.mono,
            backgroundColor: `${envColor}15`,
            color: envColor,
            border: `1px solid ${envColor}40`,
            letterSpacing: '0.5px',
        }}>
            {isQA ? '🔧' : '🚀'} {envName}
        </span>
    );
};

// Glowing Button Component
const GlowButton = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    icon: Icon,
    loading = false,
    style = {},
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: DESIGN_SYSTEM.fonts.display,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
    };

    const variants = {
        primary: {
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.accent.primary} 0%, #d97706 100%)`,
            color: DESIGN_SYSTEM.colors.text.inverse,
            boxShadow: disabled ? 'none' : '0 4px 20px rgba(245, 158, 11, 0.3)',
        },
        secondary: {
            backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
            border: `1px solid ${DESIGN_SYSTEM.colors.border.medium}`,
            color: DESIGN_SYSTEM.colors.text.primary,
        },
        danger: {
            backgroundColor: 'transparent',
            border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}`,
            color: DESIGN_SYSTEM.colors.accent.danger,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: DESIGN_SYSTEM.colors.text.secondary,
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{ ...baseStyle, ...variants[variant] }}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ display: 'inline' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : Icon ? (
                <Icon size={16} style={{ marginRight: '8px' }} />
            ) : null}
            {children}
        </button>
    );
};

// SQL Editor Component
const SqlEditor = ({ value, onChange, onExecute, loading, placeholder }) => {
    const textareaRef = useRef(null);

    return (
        <div style={{
            position: 'relative',
            backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
            borderRadius: '12px',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
                borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} style={{ color: DESIGN_SYSTEM.colors.accent.primary }} />
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: DESIGN_SYSTEM.fonts.mono,
                        color: DESIGN_SYSTEM.colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        SQL Query
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <NeonBadge variant="secondary">Ctrl+Enter</NeonBadge>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                        e.preventDefault();
                        onExecute();
                    }
                }}
                style={{
                    width: '100%',
                    minHeight: '160px',
                    padding: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: DESIGN_SYSTEM.colors.text.primary,
                    fontFamily: DESIGN_SYSTEM.fonts.mono,
                    fontSize: '13px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    outline: 'none',
                }}
                placeholder={placeholder}
            />
            <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
            }}>
                <GlowButton
                    variant="primary"
                    onClick={onExecute}
                    loading={loading}
                    icon={Play}
                >
                    Execute
                </GlowButton>
            </div>
        </div>
    );
};

// Data Table Component
const DataTable = ({ columns, data, loading, emptyMessage }) => {
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                color: DESIGN_SYSTEM.colors.text.muted,
            }}>
                <Activity size={24} className="animate-pulse" style={{ marginRight: '12px' }} />
                Loading data...
            </div>
        );
    }

    if (!columns?.length || !data?.length) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                color: DESIGN_SYSTEM.colors.text.muted,
            }}>
                <Database size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>{emptyMessage || 'No data available'}</p>
            </div>
        );
    }

    return (
        <div style={{
            overflow: 'auto',
            borderRadius: '8px',
            border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: DESIGN_SYSTEM.fonts.mono,
                fontSize: '12px',
            }}>
                <thead>
                    <tr style={{
                        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                    }}>
                        {columns.map((col) => (
                            <th
                                key={col}
                                style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    color: DESIGN_SYSTEM.colors.accent.primary,
                                    borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {col}
                            </th>
                        ))}
                        <th style={{
                            padding: '14px 16px',
                            borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                            width: '80px',
                        }}></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={index}
                            style={{
                                backgroundColor: index % 2 === 0
                                    ? 'transparent'
                                    : `${DESIGN_SYSTEM.colors.accent.primary}05`,
                                transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${DESIGN_SYSTEM.colors.accent.primary}10`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = index % 2 === 0
                                    ? 'transparent'
                                    : `${DESIGN_SYSTEM.colors.accent.primary}05`;
                            }}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col}
                                    style={{
                                        padding: '12px 16px',
                                        color: DESIGN_SYSTEM.colors.text.secondary,
                                        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={row[col]}
                                >
                                    {row[col] ?? '-'}
                                </td>
                            ))}
                            <td style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                            }}>
                                <button
                                    onClick={() => row.id && deleteData(row.id)}
                                    style={{
                                        padding: '6px 10px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}40`,
                                        borderRadius: '4px',
                                        color: DESIGN_SYSTEM.colors.accent.danger,
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.accent.danger;
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = DESIGN_SYSTEM.colors.accent.danger;
                                    }}
                                >
                                    DELETE
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// SQL History Panel - Collapsible
const SqlHistoryPanel = ({
    isOpen,
    onToggle,
    history,
    favorites,
    searchTerm,
    onSearchChange,
    onLoadQuery,
    onToggleFavorite,
    onClearHistory,
}) => {
    const filteredHistory = history.filter(item =>
        item.sql.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isFavorite = (sql) => favorites.some(fav => fav.sql === sql);

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History size={18} style={{ color: DESIGN_SYSTEM.colors.accent.primary }} />
                    <span style={{
                        fontWeight: 600,
                        fontSize: '13px',
                        color: DESIGN_SYSTEM.colors.text.primary,
                    }}>
                        Query History
                    </span>
                    {history.length > 0 && (
                        <NeonBadge variant="primary" size="sm">{history.length}</NeonBadge>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp size={18} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                ) : (
                    <ChevronDown size={18} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                )}
            </button>

            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    backgroundColor: DESIGN_SYSTEM.colors.bg.secondary,
                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '12px',
                        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: DESIGN_SYSTEM.colors.text.muted,
                            }} />
                            <input
                                type="text"
                                placeholder="Search queries..."
                                value={searchTerm}
                                onChange={onSearchChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 36px',
                                    backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                    borderRadius: '6px',
                                    color: DESIGN_SYSTEM.colors.text.primary,
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                    }}>
                        {filteredHistory.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: DESIGN_SYSTEM.colors.text.muted,
                            }}>
                                <Clock size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p style={{ fontSize: '13px' }}>
                                    {history.length === 0 ? 'No queries yet' : 'No matching queries'}
                                </p>
                            </div>
                        ) : (
                            filteredHistory.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.glass.medium;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '6px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={12} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                                            <span style={{
                                                fontSize: '11px',
                                                color: DESIGN_SYSTEM.colors.text.muted,
                                                fontFamily: DESIGN_SYSTEM.fonts.mono,
                                            }}>
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </span>
                                            <NeonBadge variant={item.success ? 'success' : 'danger'} size="sm">
                                                {item.success ? 'OK' : 'ERR'}
                                            </NeonBadge>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleFavorite(item.sql);
                                                }}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: isFavorite(item.sql) ? '#f59e0b' : DESIGN_SYSTEM.colors.text.muted,
                                                }}
                                            >
                                                <Star size={14} fill={isFavorite(item.sql) ? 'currentColor' : 'none'} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(item.sql);
                                                }}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: DESIGN_SYSTEM.colors.text.muted,
                                                }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <code
                                        onClick={() => onLoadQuery(item.sql)}
                                        style={{
                                            display: 'block',
                                            fontSize: '11px',
                                            fontFamily: DESIGN_SYSTEM.fonts.mono,
                                            color: DESIGN_SYSTEM.colors.text.secondary,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                            padding: '8px 10px',
                                            borderRadius: '4px',
                                        }}
                                        title={item.sql}
                                    >
                                        {item.sql}
                                    </code>
                                </div>
                            ))
                        )}
                    </div>

                    {favorites.length > 0 && (
                        <>
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: `${DESIGN_SYSTEM.colors.accent.primary}10`,
                                borderTop: `1px solid ${DESIGN_SYSTEM.colors.border.accent}`,
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}>
                                    <Star size={14} style={{ color: DESIGN_SYSTEM.colors.accent.primary }} />
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: DESIGN_SYSTEM.colors.accent.primary,
                                    }}>
                                        Starred ({favorites.length})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {favorites.slice(0, 3).map((fav) => (
                                        <div
                                            key={fav.id}
                                            onClick={() => onLoadQuery(fav.sql)}
                                            style={{
                                                padding: '8px 10px',
                                                backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <code style={{
                                                fontSize: '11px',
                                                fontFamily: DESIGN_SYSTEM.fonts.mono,
                                                color: DESIGN_SYSTEM.colors.text.secondary,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: 'block',
                                            }}>
                                                {fav.sql}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Admin Panels Component - Compact Design
const AdminPanels = ({ isOpen, onToggle, onUserSync, onWecomAction, userSyncState, kajialiSyncState, pendingSyncCount, currentSyncCount, initUserAadIds, setInitUserAadIds }) => {
    const isQA = import.meta.env.VITE_API_BASE?.includes('qa-kip-service-internal.kerryplus.com');
    const [corpId, setCorpId] = useState(isQA ? 'ww4aaccf11cd9ae333' : 'ww923b6887a01cf5a2');
    const [aadIds, setAadIds] = useState('');

    return (
        <div style={{ width: '100%' }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={14} style={{ color: DESIGN_SYSTEM.colors.accent.secondary }} />
                    <span style={{
                        fontWeight: 600,
                        fontSize: '12px',
                        color: DESIGN_SYSTEM.colors.text.primary,
                    }}>
                        Admin Console
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp size={14} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                ) : (
                    <ChevronDown size={14} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                )}
            </button>

            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                    {/* User Sync Service */}
                    <div style={{
                        ...styles.card,
                        borderRadius: '6px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            ...styles.cardHeader,
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Users size={14} style={{ color: DESIGN_SYSTEM.colors.accent.secondary }} />
                            <span style={{ fontWeight: 600, fontSize: '11px' }}>User Sync Service</span>
                        </div>
                        <div style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input
                                    type="text"
                                    placeholder="Corp ID"
                                    value={corpId}
                                    onChange={(e) => setCorpId(e.target.value)}
                                    style={{
                                        ...styles.input,
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="AAD IDs (optional)"
                                    value={aadIds}
                                    onChange={(e) => setAadIds(e.target.value)}
                                    style={{
                                        ...styles.input,
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                    }}
                                />
                                <GlowButton
                                    variant="primary"
                                    icon={Zap}
                                    onClick={() => onUserSync(corpId, aadIds)}
                                    loading={userSyncState.loading}
                                    style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                                >
                                    {userSyncState.loading ? 'Syncing...' : 'Sync Users'}
                                </GlowButton>
                            </div>

                            {/* Sync Progress Bar */}
                            <SyncProgressBar
                                initialCount={pendingSyncCount}
                                currentCount={currentSyncCount}
                                loading={userSyncState.loading}
                            />

                            {/* Error Message */}
                            {userSyncState.error && (
                                <div style={{
                                    marginTop: '6px',
                                    padding: '6px 8px',
                                    backgroundColor: `${DESIGN_SYSTEM.colors.accent.danger}10`,
                                    border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}30`,
                                    borderRadius: '4px',
                                    color: DESIGN_SYSTEM.colors.accent.danger,
                                    fontSize: '10px',
                                }}>
                                    {userSyncState.error}
                                </div>
                            )}

                            {/* Logs */}
                            {userSyncState.logs && userSyncState.logs.length > 0 && (
                                <div style={{ marginTop: '6px' }}>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        color: DESIGN_SYSTEM.colors.text.muted,
                                        marginBottom: '2px',
                                    }}>
                                        Sync Logs:
                                    </div>
                                    <div style={{
                                        maxHeight: '60px',
                                        overflowY: 'auto',
                                        fontSize: '10px',
                                        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                        fontFamily: DESIGN_SYSTEM.fonts.mono,
                                    }}>
                                        {userSyncState.logs.map((log, index) => (
                                            <div key={index} style={{
                                                padding: '2px 0',
                                                borderBottom: index < userSyncState.logs.length - 1
                                                    ? `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`
                                                    : 'none',
                                            }}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KA Jiali Service */}
                    <div style={{
                        ...styles.card,
                        borderRadius: '6px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            ...styles.cardHeader,
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <RefreshCcw size={14} style={{ color: DESIGN_SYSTEM.colors.accent.success }} />
                            <span style={{ fontWeight: 600, fontSize: '11px' }}>KA Jiali Service</span>
                        </div>
                        <div style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <GlowButton
                                    variant="secondary"
                                    icon={Building2}
                                    onClick={() => onWecomAction('/syncDept', '/syncDept')}
                                    loading={kajialiSyncState.loading}
                                    style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                                >
                                    Sync Depts
                                </GlowButton>
                                <input
                                    type="text"
                                    placeholder="AAD IDs (逗号分隔)"
                                    value={initUserAadIds}
                                    onChange={(e) => setInitUserAadIds(e.target.value)}
                                    style={{
                                        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                        border: `1px solid ${DESIGN_SYSTEM.colors.border.medium}`,
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        color: DESIGN_SYSTEM.colors.text.primary,
                                        fontSize: '11px',
                                        marginBottom: '6px',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <GlowButton
                                    variant="secondary"
                                    icon={Users}
                                    onClick={() => onWecomAction('/initUser', '/initUser', initUserAadIds)}
                                    loading={kajialiSyncState.loading}
                                    disabled={!initUserAadIds.trim()}
                                    style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                                >
                                    Sync Users
                                </GlowButton>
                            </div>

                            {/* Error Message */}
                            {kajialiSyncState.error && (
                                <div style={{
                                    marginTop: '6px',
                                    padding: '6px 8px',
                                    backgroundColor: `${DESIGN_SYSTEM.colors.accent.danger}10`,
                                    border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}30`,
                                    borderRadius: '4px',
                                    color: DESIGN_SYSTEM.colors.accent.danger,
                                    fontSize: '10px',
                                }}>
                                    {kajialiSyncState.error}
                                </div>
                            )}

                            {/* Logs */}
                            {kajialiSyncState.logs && kajialiSyncState.logs.length > 0 && (
                                <div style={{ marginTop: '6px' }}>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        color: DESIGN_SYSTEM.colors.text.muted,
                                        marginBottom: '2px',
                                    }}>
                                        Sync Logs:
                                    </div>
                                    <div style={{
                                        maxHeight: '60px',
                                        overflowY: 'auto',
                                        fontSize: '10px',
                                        backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                        fontFamily: DESIGN_SYSTEM.fonts.mono,
                                    }}>
                                        {kajialiSyncState.logs.map((log, index) => (
                                            <div key={index} style={{
                                                padding: '2px 0',
                                                borderBottom: index < kajialiSyncState.logs.length - 1
                                                    ? `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`
                                                    : 'none',
                                            }}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Status Bar Component
const StatusBar = ({ currentDatabase, activeTable, syncStatus }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: DESIGN_SYSTEM.colors.bg.secondary,
            borderTop: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
            fontSize: '12px',
            fontFamily: DESIGN_SYSTEM.fonts.mono,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Server size={14} style={{ color: DESIGN_SYSTEM.colors.accent.success }} />
                    <span style={{ color: DESIGN_SYSTEM.colors.text.muted }}>DB:</span>
                    <span style={{ color: DESIGN_SYSTEM.colors.accent.primary, fontWeight: 600 }}>
                        {currentDatabase || 'Not connected'}
                    </span>
                </div>
                {activeTable && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Table size={14} style={{ color: DESIGN_SYSTEM.colors.accent.secondary }} />
                        <span style={{ color: DESIGN_SYSTEM.colors.text.muted }}>Table:</span>
                        <span style={{ color: DESIGN_SYSTEM.colors.text.secondary }}>
                            {activeTable}
                        </span>
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: DESIGN_SYSTEM.colors.text.muted }}>
                    {new Date().toLocaleString()}
                </span>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: DESIGN_SYSTEM.colors.glass.medium,
                    borderRadius: '4px',
                }}>
                    <Activity size={12} style={{ color: DESIGN_SYSTEM.colors.accent.success }} />
                    <span style={{ color: DESIGN_SYSTEM.colors.text.secondary, fontSize: '11px' }}>
                        Connected
                    </span>
                </div>
            </div>
        </div>
    );
};

// SFE Data Fetch Panel Component - Displays WeCom data (departments & employees)
const SfeDataPanel = ({
    isOpen,
    onToggle,
    onFetchData,
    onExecuteFetch,
    onFetchDepartments,
    onFetchEmployees,
    sfeFetchState,
    sfeData,
}) => {
    const [activeView, setActiveView] = useState('departments');

    return (
        <div style={{ width: '100%' }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={14} style={{ color: DESIGN_SYSTEM.colors.accent.secondary }} />
                    <span style={{
                        fontWeight: 600,
                        fontSize: '12px',
                        color: DESIGN_SYSTEM.colors.text.primary,
                    }}>
                        SFE Data Fetch
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp size={14} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                ) : (
                    <ChevronDown size={14} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                )}
            </button>

            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                    {/* Action Buttons */}
                    <div style={{
                        ...styles.card,
                        borderRadius: '6px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            ...styles.cardHeader,
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Zap size={14} style={{ color: DESIGN_SYSTEM.colors.accent.primary }} />
                            <span style={{ fontWeight: 600, fontSize: '11px' }}>Quick Actions</span>
                        </div>
                        <div style={{ padding: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <GlowButton
                                    variant="primary"
                                    icon={Download}
                                    onClick={onExecuteFetch}
                                    loading={sfeFetchState.loading}
                                    style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                                >
                                    Execute Fetch
                                </GlowButton>
                                <GlowButton
                                    variant="secondary"
                                    icon={FolderTree}
                                    onClick={onFetchData}
                                    loading={sfeFetchState.loading}
                                    style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                                >
                                    Fetch All
                                </GlowButton>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                                <GlowButton
                                    variant="ghost"
                                    icon={Building}
                                    onClick={onFetchDepartments}
                                    disabled={sfeFetchState.loading}
                                    style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                                >
                                    Departments
                                </GlowButton>
                                <GlowButton
                                    variant="ghost"
                                    icon={User}
                                    onClick={onFetchEmployees}
                                    disabled={sfeFetchState.loading}
                                    style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                                >
                                    Employees
                                </GlowButton>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {sfeFetchState.error && (
                        <div style={{
                            padding: '8px 10px',
                            backgroundColor: `${DESIGN_SYSTEM.colors.accent.danger}10`,
                            border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}30`,
                            borderRadius: '4px',
                            color: DESIGN_SYSTEM.colors.accent.danger,
                            fontSize: '10px',
                        }}>
                            {sfeFetchState.error}
                        </div>
                    )}

                    {/* Logs */}
                    {sfeFetchState.logs && sfeFetchState.logs.length > 0 && (
                        <div style={{
                            ...styles.card,
                            borderRadius: '6px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                ...styles.cardHeader,
                                padding: '8px 12px',
                            }}>
                                <span style={{ fontWeight: 600, fontSize: '11px' }}>Fetch Logs</span>
                            </div>
                            <div style={{
                                maxHeight: '80px',
                                overflowY: 'auto',
                                fontSize: '10px',
                                backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                padding: '8px',
                                fontFamily: DESIGN_SYSTEM.fonts.mono,
                            }}>
                                {sfeFetchState.logs.map((log, index) => (
                                    <div key={index} style={{
                                        padding: '2px 0',
                                        borderBottom: index < sfeFetchState.logs.length - 1
                                            ? `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`
                                            : 'none',
                                        color: DESIGN_SYSTEM.colors.text.secondary,
                                    }}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {(sfeData.departments.length > 0 || sfeData.employees.length > 0) && (
                        <div style={{
                            ...styles.card,
                            borderRadius: '6px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                ...styles.cardHeader,
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '11px' }}>Fetched Data</span>
                                    <NeonBadge variant="primary" size="sm">
                                        {sfeData.departments.length + sfeData.employees.length}
                                    </NeonBadge>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => setActiveView('departments')}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            backgroundColor: activeView === 'departments'
                                                ? DESIGN_SYSTEM.colors.accent.primary
                                                : 'transparent',
                                            color: activeView === 'departments'
                                                ? DESIGN_SYSTEM.colors.text.inverse
                                                : DESIGN_SYSTEM.colors.text.secondary,
                                            border: `1px solid ${activeView === 'departments'
                                                ? DESIGN_SYSTEM.colors.accent.primary
                                                : DESIGN_SYSTEM.colors.border.subtle}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Depts ({sfeData.departments.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveView('employees')}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            backgroundColor: activeView === 'employees'
                                                ? DESIGN_SYSTEM.colors.accent.primary
                                                : 'transparent',
                                            color: activeView === 'employees'
                                                ? DESIGN_SYSTEM.colors.text.inverse
                                                : DESIGN_SYSTEM.colors.text.secondary,
                                            border: `1px solid ${activeView === 'employees'
                                                ? DESIGN_SYSTEM.colors.accent.primary
                                                : DESIGN_SYSTEM.colors.border.subtle}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Emps ({sfeData.employees.length})
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                fontSize: '10px',
                                fontFamily: DESIGN_SYSTEM.fonts.mono,
                            }}>
                                {activeView === 'departments' ? (
                                    sfeData.departments.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                                }}>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>ID</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>Name</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>Parent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sfeData.departments.slice(0, 20).map((dept, index) => (
                                                    <tr
                                                        key={index}
                                                        style={{
                                                            backgroundColor: index % 2 === 0
                                                                ? 'transparent'
                                                                : `${DESIGN_SYSTEM.colors.accent.primary}05`,
                                                        }}
                                                    >
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{dept.id || '-'}</td>
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{dept.name || '-'}</td>
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{dept.parentid || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: DESIGN_SYSTEM.colors.text.muted }}>
                                            No departments fetched yet
                                        </div>
                                    )
                                ) : (
                                    sfeData.employees.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
                                                }}>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>UserID</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>Name</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>Dept</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: DESIGN_SYSTEM.colors.accent.primary, borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>Mobile</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sfeData.employees.slice(0, 20).map((emp, index) => (
                                                    <tr
                                                        key={index}
                                                        style={{
                                                            backgroundColor: index % 2 === 0
                                                                ? 'transparent'
                                                                : `${DESIGN_SYSTEM.colors.accent.primary}05`,
                                                        }}
                                                    >
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{emp.userid || '-'}</td>
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{emp.name || '-'}</td>
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{emp.department || '-'}</td>
                                                        <td style={{ padding: '6px 10px', borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}` }}>{emp.mobile || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: DESIGN_SYSTEM.colors.text.muted }}>
                                            No employees fetched yet
                                        </div>
                                    )
                                )}
                                {((activeView === 'departments' && sfeData.departments.length > 20) ||
                                    (activeView === 'employees' && sfeData.employees.length > 20)) && (
                                    <div style={{
                                        padding: '8px',
                                        textAlign: 'center',
                                        color: DESIGN_SYSTEM.colors.text.muted,
                                        fontSize: '10px',
                                        borderTop: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                    }}>
                                        Showing first 20 of {activeView === 'departments' ? sfeData.departments.length : sfeData.employees.length} records
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Sync Progress Bar Component
const SyncProgressBar = ({ initialCount, currentCount, loading }) => {
    const percentage = initialCount > 0 ? Math.round(((initialCount - currentCount) / initialCount) * 100) : 0;

    if (initialCount <= 0) {
        return null;
    }

    return (
        <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: DESIGN_SYSTEM.colors.bg.tertiary,
            borderRadius: '8px',
            border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Activity size={14} style={{ color: DESIGN_SYSTEM.colors.accent.secondary }} />
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: DESIGN_SYSTEM.colors.text.primary,
                    }}>
                        Sync Progress
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: DESIGN_SYSTEM.fonts.mono,
                    fontSize: '12px',
                }}>
                    <span style={{
                        color: DESIGN_SYSTEM.colors.text.muted,
                    }}>
                        {initialCount - currentCount} / {initialCount}
                    </span>
                    <NeonBadge variant={loading ? 'primary' : 'success'} size="sm">
                        {percentage}%
                    </NeonBadge>
                </div>
            </div>
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: DESIGN_SYSTEM.colors.bg.surface,
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: loading
                        ? `linear-gradient(90deg, ${DESIGN_SYSTEM.colors.accent.primary} 0%, #d97706 50%, ${DESIGN_SYSTEM.colors.accent.primary} 100%)`
                        : `linear-gradient(90deg, ${DESIGN_SYSTEM.colors.accent.success} 0%, #059669 100%)`,
                    backgroundSize: '200% 100%',
                    animation: loading ? 'shimmer 1.5s infinite' : 'none',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                }} />
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            {loading && currentCount > 0 && (
                <div style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: DESIGN_SYSTEM.colors.text.muted,
                    textAlign: 'right',
                }}>
                    Syncing... {currentCount} pending
                </div>
            )}
            {!loading && percentage === 100 && (
                <div style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: DESIGN_SYSTEM.colors.accent.success,
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                }}>
                    <span style={{ fontSize: '12px' }}>✓</span> Sync completed!
                </div>
            )}
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DatabaseManagementApp = () => {
    const [databases, setDatabases] = useState([]);
    const [databaseTables, setDatabaseTables] = useState({});
    const [currentDatabase, setCurrentDatabase] = useState('');
    const [activeTable, setActiveTable] = useState('');
    const [activeTab, setActiveTab] = useState('data');
    const [tableData, setTableData] = useState({ data: [], columns: [], total: 0, page: 1, size: 20 });
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState(null);
    const [tableStructure, setTableStructure] = useState([]);
    const [sqlLoading, setSqlLoading] = useState(false);
    const [sqlError, setSqlError] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState(false);
    const [showSqlHistory, setShowSqlHistory] = useState(true);
    const [showAdminPanels, setShowAdminPanels] = useState(false);
    const [showSfePanel, setShowSfePanel] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [sqlHistory, setSqlHistory] = useState([]);
    const [favoriteQueries, setFavoriteQueries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userSyncState, setUserSyncState] = useState({
        loading: false,
        error: null,
        batchNo: '',
        logs: [],
    });
    const [kajialiSyncState, setKajialiSyncState] = useState({
        loading: false,
        error: null,
        logs: [],
    });
    const [initUserAadIds, setInitUserAadIds] = useState('');
    const [sfeFetchState, setSfeFetchState] = useState({
        loading: false,
        error: null,
        logs: [],
    });
    const [sfeData, setSfeData] = useState({
        departments: [],
        employees: [],
    });
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [currentSyncCount, setCurrentSyncCount] = useState(0);
    const loadedTablesRef = useRef(new Set());
    const loadedStructuresRef = useRef(new Set());

    // Load SQL history and favorites from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('sqlHistory');
        const savedFavorites = localStorage.getItem('sqlFavorites');
        if (savedHistory) {
            try {
                setSqlHistory(JSON.parse(savedHistory));
            } catch (e) { console.error('Failed to parse history:', e); }
        }
        if (savedFavorites) {
            try {
                setFavoriteQueries(JSON.parse(savedFavorites));
            } catch (e) { console.error('Failed to parse favorites:', e); }
        }
    }, []);

    // Fetch databases on mount
    useEffect(() => {
        fetchDatabases();
    }, []);

    const fetchDatabases = async () => {
        if (isLoading) return;
        try {
            setIsLoading(true);
            const response = await fetch('/db-manager/api/databases');
            if (!response.ok) throw new Error('Failed to fetch databases');
            const data = await response.json();
            setDatabases(data);
            if (data?.length > 0) {
                const firstDb = data[0];
                setCurrentDatabase(firstDb);
                // Load tables for all databases
                data.forEach(dbName => fetchTables(dbName));
            }
        } catch (error) {
            console.error('Error fetching databases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTables = async (dbName) => {
        if (loadedTablesRef.current.has(dbName)) return;
        try {
            const response = await fetch(`/db-manager/api/tables?dbName=${encodeURIComponent(dbName)}`);
            const data = await response.json();
            // Normalize data: handle both array of strings and array of objects
            const tablesArray = Array.isArray(data) ? data.map(item =>
                typeof item === 'string' ? { table_name: item } : item
            ) : [];
            // Store both table names and size info
            setDatabaseTables(prev => ({ ...prev, [dbName]: tablesArray }));
            loadedTablesRef.current.add(dbName);
            if (tablesArray.length > 0) {
                const firstTable = tablesArray[0].table_name;
                setActiveTable(firstTable);
                await Promise.all([
                    fetchTableData(dbName, firstTable),
                    fetchTableStructure(dbName, firstTable)
                ]);
            }
        } catch (error) {
            console.error(`Error fetching tables for ${dbName}:`, error);
        }
    };

    const fetchTableStructure = async (dbName, tableName) => {
        const cacheKey = `${dbName}:${tableName}`;
        if (loadedStructuresRef.current.has(cacheKey)) return;
        try {
            const response = await fetch(`/db-manager/api/table-structure?dbName=${dbName}&tableName=${tableName}`);
            const data = await response.json();
            setTableStructure(data);
            loadedStructuresRef.current.add(cacheKey);
        } catch (error) {
            console.error('Failed to fetch table structure:', error);
        }
    };

    const fetchTableData = async (dbName, tableName, page = 1, size = 20) => {
        try {
            setTableLoading(true);
            const response = await fetch(`/db-manager/api/table-data?dbName=${dbName}&tableName=${tableName}&page=${page}&size=${size}`);
            const data = await response.json();
            setTableData(data);
        } catch (error) {
            console.error('Failed to fetch table data:', error);
            setTableData({ data: [], columns: [], total: 0, page: 1, size: 20 });
        } finally {
            setTableLoading(false);
        }
    };

    const deleteData = async (id) => {
        try {
            const response = await fetch(`/db-manager/api/delete-data?dbName=${currentDatabase}&tableName=${activeTable}&id=${id}`, { method: 'DELETE' });
            if (response.ok) fetchTableData(currentDatabase, activeTable);
        } catch (error) {
            console.error('Failed to delete data:', error);
        }
    };

    const addToHistory = useCallback((sql, database, success = true) => {
        const item = { id: Date.now(), sql: sql.trim(), database, timestamp: new Date().toISOString(), success };
        const newHistory = [item, ...sqlHistory.filter(h => h.sql !== sql.trim())].slice(0, 100);
        setSqlHistory(newHistory);
        localStorage.setItem('sqlHistory', JSON.stringify(newHistory));
    }, [sqlHistory]);

    const toggleFavorite = useCallback((sql) => {
        const isFavorite = favoriteQueries.some(f => f.sql === sql);
        let newFavorites;
        if (isFavorite) {
            newFavorites = favoriteQueries.filter(f => f.sql !== sql);
        } else {
            newFavorites = [...favoriteQueries, { id: Date.now(), sql: sql.trim(), timestamp: new Date().toISOString() }];
        }
        setFavoriteQueries(newFavorites);
        localStorage.setItem('sqlFavorites', JSON.stringify(newFavorites));
    }, [favoriteQueries]);

    // Extract table names from SQL query
    const extractTableNames = (sql) => {
        const regex = /\b(FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi;
        const matches = [...sql.matchAll(regex)];
        return [...new Set(matches.map(match => match[2].toLowerCase()))];
    };

    // Find database that contains the specified table
    const findDatabaseForTable = (tableName) => {
        for (const dbName of databases) {
            if (databaseTables[dbName]?.some(t => {
                const tn = t?.table_name || t;
                return tn.toLowerCase() === tableName.toLowerCase();
            })) {
                return dbName;
            }
        }
        return currentDatabase;
    };

    const executeSql = async () => {
        if (!sqlQuery.trim()) return;

        // Extract table names and determine target database
        const tableNames = extractTableNames(sqlQuery);
        const targetDb = tableNames.length > 0 ? findDatabaseForTable(tableNames[0]) : currentDatabase;

        try {
            setSqlLoading(true);
            setSqlError(null);
            const response = await fetch('/db-manager/api/execute-sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `dbName=${encodeURIComponent(targetDb)}&sql=${encodeURIComponent(sqlQuery)}`
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to execute SQL');
            addToHistory(sqlQuery, targetDb, true);
            setSqlResult(data);

            // Detect and store pending sync count from the specific query
            const normalizedQuery = sqlQuery.toLowerCase().replace(/\s+/g, ' ').trim();
            if (normalizedQuery.includes('select count(*)') &&
                normalizedQuery.includes('us_user') &&
                normalizedQuery.includes('sync_status=0')) {
                // Extract count from result - data is array of objects with the count
                if (data.data && data.data.length > 0) {
                    const firstRow = data.data[0];
                    // The count could be in different column names depending on the DB
                    const countValue = Object.values(firstRow)[0];
                    const count = parseInt(countValue, 10);
                    if (!isNaN(count)) {
                        setPendingSyncCount(count);
                        setCurrentSyncCount(count);
                    }
                }
            }

            setActiveTab('sqlResult');
        } catch (error) {
            console.error('SQL execution failed:', error);
            setSqlError(error.message);
            addToHistory(sqlQuery, targetDb, false);
        } finally {
            setSqlLoading(false);
        }
    };

    const handleSyncAadUsers = async () => {
        try {
            setSyncLoading(true);
            await fetch('/admin/aad_users/manual_sync', { method: 'PUT' });
            alert('AAD users synced successfully');
        } catch (error) {
            console.error('Failed to sync AAD users:', error);
            setSyncError(true);
        } finally {
            setSyncLoading(false);
        }
    };

    const handleUserSync = async (corpId, aadIds) => {
        if (!corpId || typeof corpId !== 'string' || corpId.trim() === '') {
            setUserSyncState(prev => ({
                ...prev,
                error: 'Please enter a valid Corp ID',
                loading: false
            }));
            return;
        }

        let parsedAadIds = null;
        if (aadIds && aadIds.trim() !== '') {
            parsedAadIds = aadIds.split(',').map(id => id.trim()).filter(id => id !== '');
            if (parsedAadIds.length === 0) {
                parsedAadIds = null;
            }
        }

        const pollSyncCount = async () => {
            try {
                const pollResponse = await fetch('/db-manager/api/execute-sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `dbName=${encodeURIComponent(currentDatabase)}&sql=${encodeURIComponent('select count(*) as cnt from us_user where sync_status=0')}`
                });
                if (pollResponse.ok) {
                    const data = await pollResponse.json();
                    if (data.data && data.data.length > 0) {
                        const firstRow = data.data[0];
                        const countValue = Object.values(firstRow)[0];
                        const count = parseInt(countValue, 10);
                        if (!isNaN(count)) {
                            setCurrentSyncCount(count);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to poll sync count:', error);
            }
        };

        try {
            setUserSyncState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, `Starting sync for Corp ID: ${corpId}${parsedAadIds ? `, 指定同步 ${parsedAadIds.length} 个用户` : ''}...`]
            }));

            // Start polling the sync count
            const pollInterval = setInterval(pollSyncCount, 2000);

            const body = parsedAadIds ? JSON.stringify(parsedAadIds) : undefined;
            const response = await fetch(`/admin/user-sync/${encodeURIComponent(corpId.trim())}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body
            });

            if (!response.ok) throw new Error('User sync failed');
            const batchNo = await response.text();

            // Stop polling and reset state immediately when sync is done
            clearInterval(pollInterval);

            // Get final count and update state
            await pollSyncCount();

            setUserSyncState(prev => ({
                ...prev,
                loading: false,
                batchNo,
                logs: [...prev.logs, `Sync started with batch number: ${batchNo}`, 'Sync completed successfully!']
            }));
        } catch (error) {
            console.error('User sync failed:', error);
            setUserSyncState(prev => ({
                ...prev,
                error: error.message || 'Failed to start user sync',
                loading: false,
                logs: [...prev.logs, `Error: ${error.message}`]
            }));
        }
    };

    const handleWecomAction = async (endpoint, actionType, aadIds = '') => {
        const actionName = actionType === '/syncDept' ? 'Departments' : 'Users';

        const pollSyncCount = async () => {
            try {
                const pollResponse = await fetch('/db-manager/api/execute-sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `dbName=${encodeURIComponent(currentDatabase)}&sql=${encodeURIComponent('select count(*) as cnt from us_user where sync_status=0 and deleted=0')}`
                });
                if (pollResponse.ok) {
                    const data = await pollResponse.json();
                    if (data.data && data.data.length > 0) {
                        const firstRow = data.data[0];
                        const countValue = Object.values(firstRow)[0];
                        const count = parseInt(countValue, 10);
                        if (!isNaN(count)) {
                            setCurrentSyncCount(count);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to poll sync count:', error);
            }
        };

        try {
            setKajialiSyncState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, `Starting sync ${actionName.toLowerCase()}...`]
            }));

            // Start polling the sync count
            const pollInterval = setInterval(pollSyncCount, 2000);

            // 根据端点类型选择请求方式
            if (actionType === '/initUser') {
                // POST with JSON body for initUser
                const aadIdList = aadIds.split(',').map(id => id.trim()).filter(id => id);
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aadIdList)
                });
            } else {
                // GET for syncDept
                await fetch(endpoint, { method: 'GET' });
            }

            // Stop polling
            clearInterval(pollInterval);

            // Get final count and update state
            await pollSyncCount();

            setKajialiSyncState(prev => ({
                ...prev,
                loading: false,
                logs: [...prev.logs, `${actionName} synced successfully!`]
            }));
        } catch (error) {
            console.error(`Failed to sync ${actionName}:`, error);
            setKajialiSyncState(prev => ({
                ...prev,
                loading: false,
                error: error.message || `Failed to sync ${actionName.toLowerCase()}`,
                logs: [...prev.logs, `Error: ${error.message}`]
            }));
        }
    };

    // SFE Data Fetch Functions
    const handleSfeFetchData = async () => {
        try {
            setSfeFetchState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, 'SFE: 开始获取企业微信数据...']
            }));

            const response = await fetch('/admin/user-sync/sfe/fetch');
            if (!response.ok) throw new Error('获取企业数据失败');
            const data = await response.json();

            setSfeData({
                departments: data.departments || [],
                employees: data.employees || [],
            });

            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                logs: [...prev.logs, `SFE: 获取到 ${data.departments?.length || 0} 个部门, ${data.employees?.length || 0} 名员工`]
            }));
        } catch (error) {
            console.error('SFE fetch failed:', error);
            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                error: error.message || '获取企业数据失败',
                logs: [...prev.logs, `SFE Error: ${error.message}`]
            }));
        }
    };

    const handleSfeExecuteFetch = async () => {
        try {
            setSfeFetchState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, 'SFE: 手动触发数据获取任务...']
            }));

            const response = await fetch('/admin/user-sync/sfe/fetch/execute', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('执行数据获取任务失败');
            const result = await response.json();

            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                logs: [...prev.logs, `SFE: 任务执行成功 - 成功: ${result.success}, 失败: ${result.failed}`]
            }));

            // Fetch the data after execution
            await handleSfeFetchData();
        } catch (error) {
            console.error('SFE execute fetch failed:', error);
            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                error: error.message || '执行数据获取任务失败',
                logs: [...prev.logs, `SFE Error: ${error.message}`]
            }));
        }
    };

    const handleSfeFetchDepartments = async () => {
        try {
            setSfeFetchState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, 'SFE: 开始获取部门列表...']
            }));

            const response = await fetch('/admin/user-sync/sfe/departments');
            if (!response.ok) throw new Error('获取部门列表失败');
            const departments = await response.json();

            setSfeData(prev => ({
                ...prev,
                departments,
            }));

            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                logs: [...prev.logs, `SFE: 获取到 ${departments.length} 个部门`]
            }));
        } catch (error) {
            console.error('SFE fetch departments failed:', error);
            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                error: error.message || '获取部门列表失败',
                logs: [...prev.logs, `SFE Error: ${error.message}`]
            }));
        }
    };

    const handleSfeFetchEmployees = async () => {
        try {
            setSfeFetchState(prev => ({
                ...prev,
                loading: true,
                error: null,
                logs: [...prev.logs, 'SFE: 开始获取员工列表...']
            }));

            const response = await fetch('/admin/user-sync/sfe/employees');
            if (!response.ok) throw new Error('获取员工列表失败');
            const employees = await response.json();

            setSfeData(prev => ({
                ...prev,
                employees,
            }));

            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                logs: [...prev.logs, `SFE: 获取到 ${employees.length} 名员工`]
            }));
        } catch (error) {
            console.error('SFE fetch employees failed:', error);
            setSfeFetchState(prev => ({
                ...prev,
                loading: false,
                error: error.message || '获取员工列表失败',
                logs: [...prev.logs, `SFE Error: ${error.message}`]
            }));
        }
    };

    const handleTableSelect = async (dbName, tableName) => {
        setCurrentDatabase(dbName);
        setActiveTable(tableName);
        await Promise.all([
            fetchTableData(dbName, tableName),
            fetchTableStructure(dbName, tableName)
        ]);
    };

    return (
        <div style={styles.container}>
            <Split
                key={showSidebar ? 'split-visible' : 'split-hidden'}
                sizes={showSidebar ? [12, 88] : [0, 100]}
                minSize={showSidebar ? 180 : 0}
                gutterSize={showSidebar ? 4 : 0}
                snapOffset={30}
                className="flex min-h-screen"
                style={{ display: 'flex' }}
            >
                {showSidebar && (
                /* Sidebar */
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.accent.primary} 0%, #b45309 100%)`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                            }}>
                                <Database size={22} style={{ color: '#0a0a0f' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h1 style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        margin: 0,
                                        letterSpacing: '-0.5px',
                                        fontFamily: DESIGN_SYSTEM.fonts.display,
                                    }}>
                                        DB Manager
                                    </h1>
                                    <EnvironmentBadge />
                                </div>
                                <p style={{
                                    fontSize: '10px',
                                    color: DESIGN_SYSTEM.colors.text.muted,
                                    margin: '2px 0 0 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>
                                    Database Console
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '16px', overflowY: 'auto', height: 'calc(100vh - 100px)' }}>
                        {databases.map(dbName => (
                            <div key={dbName} style={{ marginBottom: '16px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: DESIGN_SYSTEM.colors.bg.elevated,
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => fetchTables(dbName)}
                                >
                                    <Server size={14} style={{ color: DESIGN_SYSTEM.colors.accent.primary }} />
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        fontFamily: DESIGN_SYSTEM.fonts.mono,
                                    }}>
                                        {dbName}
                                    </span>
                                    <NeonBadge variant="secondary" size="sm">
                                        {databaseTables[dbName]?.length || 0}
                                    </NeonBadge>
                                </div>
                                <div style={{ marginLeft: '16px' }}>
                                    {databaseTables[dbName]?.map(tableInfo => {
                                        const tableName = tableInfo?.table_name || tableInfo;
                                        const rowCount = tableInfo?.approximate_row_count;
                                        return (
                                        <button
                                            key={`${dbName}-${tableName}`}
                                            onClick={() => handleTableSelect(dbName, tableName)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                marginBottom: '4px',
                                                backgroundColor: currentDatabase === dbName && activeTable === tableName
                                                    ? `${DESIGN_SYSTEM.colors.accent.primary}15`
                                                    : 'transparent',
                                                border: currentDatabase === dbName && activeTable === tableName
                                                    ? `1px solid ${DESIGN_SYSTEM.colors.border.accent}`
                                                    : '1px solid transparent',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease',
                                                color: currentDatabase === dbName && activeTable === tableName
                                                    ? DESIGN_SYSTEM.colors.accent.primary
                                                    : DESIGN_SYSTEM.colors.text.secondary,
                                                fontSize: '12px',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!(currentDatabase === dbName && activeTable === tableName)) {
                                                    e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.glass.medium;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!(currentDatabase === dbName && activeTable === tableName)) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <Table size={12} />
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tableName}
                                            </span>
                                            <span style={{
                                                fontSize: '10px',
                                                fontFamily: DESIGN_SYSTEM.fonts.mono,
                                                color: DESIGN_SYSTEM.colors.text.muted,
                                            }}>
                                                {typeof rowCount === 'number' && rowCount > 0 ? `${rowCount.toLocaleString()} rows` : 'No data'}
                                            </span>
                                        </button>
                                    )})}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Main Content */}
                <div style={styles.mainPanel}>
                    {/* Top Bar */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <NeonBadge variant="primary">
                                {currentDatabase || 'No DB Selected'}
                            </NeonBadge>
                            {activeTable && (
                                <>
                                    <ChevronRight size={16} style={{ color: DESIGN_SYSTEM.colors.text.muted }} />
                                    <NeonBadge variant="secondary">
                                        {activeTable}
                                    </NeonBadge>
                                </>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GlowButton
                                variant="secondary"
                                icon={RefreshCcw}
                                onClick={handleSyncAadUsers}
                                loading={syncLoading}
                            >
                                Sync AAD
                            </GlowButton>
                            <GlowButton
                                variant="ghost"
                                icon={showSidebar ? PanelLeftClose : PanelLeftOpen}
                                onClick={() => setShowSidebar(!showSidebar)}
                                title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
                            />
                            <GlowButton
                                variant="ghost"
                                icon={Shield}
                                onClick={() => setShowAdminPanels(!showAdminPanels)}
                            >
                                Admin
                            </GlowButton>
                            <GlowButton
                                variant="ghost"
                                icon={Download}
                                onClick={() => setShowSfePanel(!showSfePanel)}
                            >
                                SFE
                            </GlowButton>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ padding: '24px', paddingBottom: '80px' }}>
                        {/* Header Controls */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <SqlHistoryPanel
                                isOpen={showSqlHistory}
                                onToggle={() => setShowSqlHistory(!showSqlHistory)}
                                history={sqlHistory}
                                favorites={favoriteQueries}
                                searchTerm={historySearchTerm}
                                onSearchChange={(e) => setHistorySearchTerm(e.target.value)}
                                onLoadQuery={setSqlQuery}
                                onToggleFavorite={toggleFavorite}
                                onClearHistory={() => {
                                    setSqlHistory([]);
                                    localStorage.removeItem('sqlHistory');
                                }}
                            />
                            <div style={{ flex: '0 0 280px', flexShrink: 0 }}>
                                <AdminPanels
                                    isOpen={showAdminPanels}
                                    onToggle={() => setShowAdminPanels(!showAdminPanels)}
                                    onUserSync={handleUserSync}
                                    onWecomAction={handleWecomAction}
                                    userSyncState={userSyncState}
                                    kajialiSyncState={kajialiSyncState}
                                    pendingSyncCount={pendingSyncCount}
                                    currentSyncCount={currentSyncCount}
                                    initUserAadIds={initUserAadIds}
                                    setInitUserAadIds={setInitUserAadIds}
                                />
                            </div>
                            <div style={{ flex: '0 0 280px', flexShrink: 0 }}>
                                <SfeDataPanel
                                    isOpen={showSfePanel}
                                    onToggle={() => setShowSfePanel(!showSfePanel)}
                                    onFetchData={handleSfeFetchData}
                                    onExecuteFetch={handleSfeExecuteFetch}
                                    onFetchDepartments={handleSfeFetchDepartments}
                                    onFetchEmployees={handleSfeFetchEmployees}
                                    sfeFetchState={sfeFetchState}
                                    sfeData={sfeData}
                                />
                            </div>
                        </div>

                        {/* SQL Editor */}
                        <div style={{ marginBottom: '24px' }}>
                            <SqlEditor
                                value={sqlQuery}
                                onChange={(e) => setSqlQuery(e.target.value)}
                                onExecute={executeSql}
                                loading={sqlLoading}
                                placeholder="Enter your SQL query... (Press Ctrl+Enter to execute)"
                            />
                            {sqlError && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px 16px',
                                    backgroundColor: `${DESIGN_SYSTEM.colors.accent.danger}10`,
                                    border: `1px solid ${DESIGN_SYSTEM.colors.accent.danger}30`,
                                    borderRadius: '8px',
                                    color: DESIGN_SYSTEM.colors.accent.danger,
                                    fontSize: '13px',
                                    fontFamily: DESIGN_SYSTEM.fonts.mono,
                                }}>
                                    Error: {sqlError}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            gap: '0',
                            borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                            marginBottom: '20px',
                        }}>
                            {[
                                { id: 'data', label: 'Data', icon: Eye },
                                { id: 'structure', label: 'Structure', icon: Layers },
                                { id: 'sqlResult', label: 'SQL Results', icon: Code },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab.id
                                            ? `2px solid ${DESIGN_SYSTEM.colors.accent.primary}`
                                            : '2px solid transparent',
                                        color: activeTab === tab.id
                                            ? DESIGN_SYSTEM.colors.accent.primary
                                            : DESIGN_SYSTEM.colors.text.muted,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={styles.card}>
                            {activeTab === 'data' && (
                                <DataTable
                                    columns={tableData.columns}
                                    data={tableData.data}
                                    loading={tableLoading}
                                    emptyMessage="No data available"
                                />
                            )}
                            {activeTab === 'structure' && (
                                <DataTable
                                    columns={['Column', 'Type', 'Nullable', 'Default', 'Comment']}
                                    data={tableStructure.map(col => ({
                                        Column: col.column_name,
                                        Type: col.data_type,
                                        Nullable: col.is_nullable,
                                        Default: col.column_default || '-',
                                        Comment: col.column_comment || '-',
                                    }))}
                                    emptyMessage="No structure information available"
                                />
                            )}
                            {activeTab === 'sqlResult' && (
                                <DataTable
                                    columns={sqlResult?.columns || []}
                                    data={sqlResult?.data || []}
                                    emptyMessage="No SQL results yet. Execute a query to see results."
                                />
                            )}
                        </div>

                        {/* Pagination */}
                        {activeTab === 'data' && tableData.total > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                backgroundColor: DESIGN_SYSTEM.colors.bg.secondary,
                                border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                                borderTop: 'none',
                                borderRadius: '0 0 8px 8px',
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: DESIGN_SYSTEM.colors.text.muted,
                                    fontFamily: DESIGN_SYSTEM.fonts.mono,
                                }}>
                                    Showing {tableData.data.length} of {tableData.total} rows
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <GlowButton
                                        variant="secondary"
                                        onClick={() => fetchTableData(currentDatabase, activeTable, tableData.page - 1, tableData.size)}
                                        disabled={tableData.page <= 1}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        Previous
                                    </GlowButton>
                                    <span style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        fontFamily: DESIGN_SYSTEM.fonts.mono,
                                        color: DESIGN_SYSTEM.colors.text.secondary,
                                    }}>
                                        Page {tableData.page} of {Math.ceil(tableData.total / tableData.size)}
                                    </span>
                                    <GlowButton
                                        variant="secondary"
                                        onClick={() => fetchTableData(currentDatabase, activeTable, tableData.page + 1, tableData.size)}
                                        disabled={tableData.page >= Math.ceil(tableData.total / tableData.size)}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        Next
                                    </GlowButton>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <StatusBar
                        currentDatabase={currentDatabase}
                        activeTable={activeTable}
                        syncStatus="connected"
                    />
                </div>
            </Split>
        </div>
    );
};


export default DatabaseManagementApp;
