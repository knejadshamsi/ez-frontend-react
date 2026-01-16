import { Spin, Alert, Button } from 'antd';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { generateEmissionsParagraph2Text } from '~ez/output/utils/emissionsTextGenerator';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

/**
 * Emissions Paragraph 2 - PM2.5 concentration and vehicle fleet composition
 * SSE Message: data_text_paragraph2_emissions
 */
export const EmissionsParagraph2 = () => {
  const paragraph2Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Data);
  const paragraph2State = useEZOutputEmissionsStore((state) => state.emissionsParagraph2State);
  const paragraph2Error = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph2_emissions');
    }
  };

  if (paragraph2Error) {
    return (
      <Alert
        message="Failed to load air quality data"
        description={paragraph2Error}
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

  if (paragraph2State === 'inactive' || paragraph2State === 'loading' || !paragraph2Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  const paragraphText = generateEmissionsParagraph2Text(paragraph2Data);

  return (
    <p className={outputStyles.smallParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
