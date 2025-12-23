// === MESSAGE DECODER ===

// Decodes SSE message types into categories for routing to appropriate handlers
// Uses semantic prefix-based routing: pa_, success_, error_, data_
export function decodeSSEMessage(messageType: string): {
  category: 'progress_alert' | 'data';
  message: string;
} {
  // Special case: heartbeat (no prefix)
  if (messageType === 'heartbeat') {
    return {
      category: 'progress_alert',
      message: 'heartbeat',
    };
  }

  // Split on underscore and check prefix
  const parts = messageType.split('_');
  const prefix = parts[0];

  switch (prefix) {
    case 'pa':
      // Progress alerts: pa_connection, pa_phase_*
      return {
        category: 'progress_alert',
        message: messageType,
      };

    case 'success':
      // Success events: success_process, success_phase_*, success_map_*
      return {
        category: 'progress_alert',
        message: messageType,
      };

    case 'error':
      // Error events: error_global, error_phase_*, error_map_*
      return {
        category: 'progress_alert',
        message: messageType,
      };

    case 'data':
      // Data payloads: data_text_*, data_chart_*, data_table_*
      return {
        category: 'data',
        message: messageType,
      };

    default:
      console.warn(`[SSE] Unknown message type: ${messageType}`);
      return {
        category: 'data',
        message: messageType,
      };
  }
}
