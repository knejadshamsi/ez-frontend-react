import { Spin } from 'antd';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { generatePeopleResponseParagraph2Text } from '../utils/peopleResponseTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * People Response Paragraph 2 - time impacts and elasticity
 * SSE Message: data_people_response_paragraph2
 */
export const Paragraph2= () => {
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraph2Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Data);
  const paragraphText = generatePeopleResponseParagraph2Text(paragraph1Data, paragraph2Data);

  if (!paragraph2Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <p className={outputStyles.smallParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
