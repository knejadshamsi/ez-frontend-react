import { useState, type ReactElement } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MessageInstance } from 'antd/es/message/interface';
import { useTranslation } from 'react-i18next';
import './locales';

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
  text,
  size = 'small',
  type = 'default',
  ghost = false,
  className,
  disabled = false,
  tooltipText,
}: CopyRequestIdButtonProps): ReactElement => {
  const { t } = useTranslation('ez-components');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const handleCopy = async () => {

    if (!requestId || requestId.trim() === '') {
      messageApi.error(t('copyRequestId.noIdAvailable'));
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
      messageApi.success(t('copyRequestId.copiedSuccess'));

      // Reset to idle after brief success indication
      setTimeout(() => {
        setCopyState('idle');
      }, 1500);
    } catch (error) {
      console.error('Failed to copy request ID:', error);
      setCopyState('idle');
      messageApi.error(t('copyRequestId.copyFailed'));
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
        return t('copyRequestId.copying');
      case 'success':
        return t('copyRequestId.copied');
      case 'idle':
      default:
        return text || t('copyRequestId.copyId');
    }
  };

  return (
    <Tooltip title={tooltipText || t('copyRequestId.tooltipCopyId')}>
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
