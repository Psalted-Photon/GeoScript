import React from 'react';
import { BibleVersionId, BIBLE_VERSIONS, DEFAULT_VERSION } from '../../types/bible';

interface BibleVersionSelectorProps {
    selectedVersion: BibleVersionId;
    onVersionChange: (version: BibleVersionId) => void;
    showInterlinearToggle?: boolean;
    interlinearEnabled?: boolean;
    onInterlinearToggle?: (enabled: boolean) => void;
}

const BibleVersionSelector: React.FC<BibleVersionSelectorProps> = ({
    selectedVersion,
    onVersionChange,
    showInterlinearToggle = false,
    interlinearEnabled = false,
    onInterlinearToggle
}) => {
    const currentVersion = BIBLE_VERSIONS.find(v => v.id === selectedVersion);
    const canUseInterlinear = currentVersion?.supportsInterlinear ?? false;

    return (
        <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            padding: '10px 15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            {/* Version Selector */}
            <div style={{ flex: 1 }}>
                <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#666',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Bible Version
                </label>
                <select
                    value={selectedVersion}
                    onChange={(e) => onVersionChange(e.target.value as BibleVersionId)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3498db'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                >
                    {BIBLE_VERSIONS.map(version => (
                        <option key={version.id} value={version.id}>
                            {version.name} - {version.fullName}
                        </option>
                    ))}
                </select>
                
                {/* Copyright Notice */}
                {currentVersion?.copyrightYear && (
                    <div style={{
                        marginTop: '5px',
                        fontSize: '10px',
                        color: '#999',
                        fontStyle: 'italic'
                    }}>
                        © {currentVersion.copyrightYear}
                    </div>
                )}
            </div>

            {/* Interlinear Toggle */}
            {showInterlinearToggle && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                }}>
                    <label style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Interlinear
                    </label>
                    <button
                        onClick={() => onInterlinearToggle?.(!interlinearEnabled)}
                        disabled={!canUseInterlinear}
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: canUseInterlinear ? 'pointer' : 'not-allowed',
                            backgroundColor: interlinearEnabled && canUseInterlinear ? '#1976d2' : '#e0e0e0',
                            color: interlinearEnabled && canUseInterlinear ? 'white' : '#999',
                            transition: 'all 0.2s',
                            opacity: canUseInterlinear ? 1 : 0.5
                        }}
                        title={canUseInterlinear ? 'Toggle Hebrew/Greek interlinear' : 'Interlinear only available for KJV'}
                    >
                        {interlinearEnabled ? 'ON' : 'OFF'}
                    </button>
                    {!canUseInterlinear && (
                        <div style={{
                            fontSize: '9px',
                            color: '#f44336',
                            textAlign: 'center',
                            marginTop: '2px'
                        }}>
                            KJV only
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BibleVersionSelector;
