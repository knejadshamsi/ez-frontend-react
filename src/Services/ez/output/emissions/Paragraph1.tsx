import { Spin } from 'antd';
import { useEZOutputEmissionsStore } from '~stores/output';
import { generateEmissionsParagraph1Text } from '../utils/emissionsTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * Emissions Paragraph 1 - CO2 reduction and Paris Agreement context
 * SSE Message: data_emissions_paragraph1
 */
export const Paragraph1= () => {
  const paragraph1Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
  const paragraphText = generateEmissionsParagraph1Text(paragraph1Data);

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
