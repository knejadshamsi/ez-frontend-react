import { Spin, Alert, Button } from 'antd';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '../../api/retryComponent';
import { generatePeopleResponseParagraph1Text } from '../utils/peopleResponseTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * People Response Paragraph 1 - behavioral breakdown and benchmarks
 * SSE Message: data_text_paragraph1_people_response
 */
export const Paragraph1= () => {
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraph1State = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1State);
  const paragraph1Error = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_people_response');
    }
  };

  if (paragraph1Error) {
    return (
      <Alert
        message="Failed to load behavioral response data"
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

  const paragraphText = generatePeopleResponseParagraph1Text(paragraph1Data);

  return (
    <p className={outputStyles.contentParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
