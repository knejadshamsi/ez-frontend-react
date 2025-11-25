import { TIMELINE_EVENTS } from './constants';

// === MESSAGE DECODER ===

export function decodeSSEMessage(messageType: string): {
  category: 'progress_alert' | 'data';
  message: string;
} {

  if (messageType.startsWith('pa_')) {
    return {
      category: 'progress_alert',
      message: messageType.slice(3),
    };
  }


  if (messageType.startsWith('data_')) {
    return {
      category: 'data',
      message: messageType,
    };
  }

  if (['started', 'heartbeat', 'complete', 'error'].includes(messageType)) {
    return {
      category: 'progress_alert',
      message: messageType,
    };
  }

  if (TIMELINE_EVENTS.includes(messageType)) {
    return {
      category: 'progress_alert',
      message: messageType,
    };
  }

  if (messageType.startsWith('map_ready_')) {
    return {
      category: 'progress_alert',
      message: messageType,
    };
  }

  console.warn(`[SSE] Unknown message type: ${messageType}`);
  return {
    category: 'data',
    message: messageType,
  };
}
