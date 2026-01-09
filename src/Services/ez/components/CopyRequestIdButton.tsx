import { useState, type ReactElement } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MessageInstance } from 'antd/es/message/interface';

type CopyState = 'idle' | 'copying' | 'success';

interface CopyRequestIdButtonProps {
  requestId: string;
  messageApi: MessageInstance;
  showText?: boolean;
  text?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'text' | 'primary' | 'link' | 'dashed';
  ghost?: boolean;
  className?: string;
  disabled?: boolean;
  tooltipText?: string;
}

export const CopyRequestIdButton = ({
  requestId,
  messageApi,
  showText = true,
  text = 'Copy ID',
  size = 'small',
  type = 'default',
  ghost = false,
  className,
  disabled = false,
  tooltipText = 'Copy Request ID',
}: CopyRequestIdButtonProps): ReactElement => {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const handleCopy = async () => {

    if (!requestId || requestId.trim() === '') {
      messageApi.error('No request ID available to copy');
      return;
    }

    setCopyState('copying');

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(requestId);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = requestId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }

      // Show success state
      setCopyState('success');
      messageApi.success('Request ID copied to clipboard');

      // Reset to idle after brief success indication
      setTimeout(() => {
        setCopyState('idle');
      }, 1500);
    } catch (error) {
      console.error('Failed to copy request ID:', error);
      setCopyState('idle');
      messageApi.error('Failed to copy request ID. Please try again or copy manually.');
    }
  };

  const getIcon = () => {
    switch (copyState) {
      case 'copying':
        return <LoadingOutlined spin />;
      case 'success':
        return <CheckOutlined />;
      case 'idle':
      default:
        return <CopyOutlined />;
    }
  };

  const getButtonText = () => {
    if (!showText) return null;

    switch (copyState) {
      case 'copying':
        return 'Copying...';
      case 'success':
        return 'Copied!';
      case 'idle':
      default:
        return text;
    }
  };

  return (
    <Tooltip title={tooltipText}>
      <Button
        type={type}
        size={size}
        ghost={ghost}
        icon={getIcon()}
        onClick={handleCopy}
        disabled={disabled || copyState === 'copying'}
        className={className}
        aria-label="Copy Request ID to clipboard"
      >
        {getButtonText()}
      </Button>
    </Tooltip>
  );
};
