import { Spin, Alert, Button } from 'antd';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { generatePeopleResponseParagraph2Text } from '~ez/output/utils/peopleResponseTextGenerator';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

/**
 * People Response Paragraph 2 - time impacts and elasticity
 * SSE Message: data_text_paragraph2_people_response
 */
export const PeopleResponseParagraph2 = () => {
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraph2Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Data);
  const paragraph2State = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2State);
  const paragraph2Error = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph2_people_response');
    }
  };

  if (paragraph2Error) {
    return (
      <Alert
        message="Failed to load time impact data"
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

  const paragraphText = generatePeopleResponseParagraph2Text(paragraph1Data, paragraph2Data);

  return (
    <p className={outputStyles.smallParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
