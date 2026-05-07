import React from 'react';
import Button from './Button';

export default function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
      <Button 
        variant="ghost" 
        disabled={pageNumber === 0} 
        onClick={() => onPageChange(pageNumber - 1)}
      >
        Previous
      </Button>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Page {pageNumber + 1} of {totalPages}
      </span>
      <Button 
        variant="ghost" 
        disabled={pageNumber >= totalPages - 1} 
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
      </Button>
    </div>
  );
}
