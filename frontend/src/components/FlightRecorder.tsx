import React, { useState } from 'react';
import { FlightLog, FlightLogType } from '../utils/mockAuthEngine';
import './FlightRecorder.css';

export interface FlightRecorderProps {
  /** Array of flight logs to visualize */
  logs: FlightLog[];
}

const highlightJSON = (jsonString: string) => {
  const escaped = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlighted = escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'json-value';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    } else {
      cls = 'json-number';
    }
    return `<span class="${cls}">${match}</span>`;
  });
  return { __html: highlighted };
};

export const FlightRecorder: React.FC<FlightRecorderProps> = ({ logs }) => {
  // Track which rows are expanded to "Show the Glue"
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flight-recorder">
      <table className="flight-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Summary</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <React.Fragment key={log.id}>
              <tr className="flight-row">
                <td className="time-col">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
                </td>
                <td className={`type-col type-${log.type.toLowerCase().replace('_', '-')}`}>
                  {log.type}
                </td>
                <td>{log.summary}</td>
                <td>
                  <button className="glue-btn" onClick={() => toggleRow(log.id)}>
                    {expandedRows.has(log.id) ? '[-] Hide the Glue' : '[+] Show the Glue'}
                  </button>
                </td>
              </tr>
              {expandedRows.has(log.id) && (
                <tr className="glue-row">
                  <td colSpan={4}>
                    <div className="glue-content">
                      <div className="glue-header">
                        // Raw Protocol Payload / "The Glue"
                      </div>
                      <pre>
                        <code dangerouslySetInnerHTML={highlightJSON(JSON.stringify(log.payload, null, 2))} />
                      </pre>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="empty-state">
                No flight logs recorded yet. Awaiting protocol handshakes...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
