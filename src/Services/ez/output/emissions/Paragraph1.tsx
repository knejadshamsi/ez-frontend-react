import { Spin, Alert, Button } from 'antd';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { generateEmissionsParagraph1Text } from '~ez/output/utils/emissionsTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * Emissions Paragraph 1 - CO2 reduction and Paris Agreement context
 * SSE Message: data_text_paragraph1_emissions
 */
export const Paragraph1= () => {
  const paragraph1Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
  const paragraph1State = useEZOutputEmissionsStore((state) => state.emissionsParagraph1State);
  const paragraph1Error = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_emissions');
    }
  };

  if (paragraph1Error) {
    return (
      <Alert
        message="Failed to load emissions comparison data"
        description={paragraph1Error}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (paragraph1State === 'inactive' || paragraph1State === 'loading' || !paragraph1Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  const paragraphText = generateEmissionsParagraph1Text(paragraph1Data);

  return (
    <p className={outputStyles.contentParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
