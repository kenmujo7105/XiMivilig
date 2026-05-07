import React from 'react';
import { TOURNAMENT_STATUS } from '../../utils/constants';

export default function Badge({ status, text }) {
  const getBadgeStyle = () => {
    switch (status) {
      case TOURNAMENT_STATUS.DRAFT:
        return { backgroundColor: 'rgba(100, 116, 139, 0.2)', color: 'var(--status-gray)', border: '1px solid var(--status-gray)' };
      case TOURNAMENT_STATUS.REGISTRATION_OPEN:
      case 'APPROVED':
        return { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-green)', border: '1px solid var(--status-green)' };
      case TOURNAMENT_STATUS.REGISTRATION_CLOSED:
      case 'PENDING':
        return { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--status-yellow)', border: '1px solid var(--status-yellow)' };
      case TOURNAMENT_STATUS.IN_PROGRESS:
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--status-blue)', border: '1px solid var(--status-blue)', animation: 'pulse 2s infinite' };
      case TOURNAMENT_STATUS.COMPLETED:
        return { backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--status-purple)', border: '1px solid var(--status-purple)' };
      case TOURNAMENT_STATUS.CANCELLED:
      case 'REJECTED':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-red)', border: '1px solid var(--status-red)' };
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)', border: '1px solid var(--border-color)' };
    }
  };

  return (
    <span className="badge" style={getBadgeStyle()}>
      {text || status}
    </span>
  );
}
