import { Spin } from 'antd';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { generatePeopleResponseParagraph1Text } from '../utils/peopleResponseTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * People Response Paragraph 1 - behavioral breakdown and benchmarks
 * SSE Message: data_people_response_paragraph1
 */
export const Paragraph1= () => {
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraphText = generatePeopleResponseParagraph1Text(paragraph1Data);

  if (!paragraph1Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <p className={outputStyles.contentParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
