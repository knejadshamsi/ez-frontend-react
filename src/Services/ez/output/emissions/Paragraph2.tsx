import { Spin } from 'antd';
import { useEZOutputEmissionsStore } from '~stores/output';
import { generateEmissionsParagraph2Text } from '../utils/emissionsTextGenerator';
import { HighlightedText } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * Emissions Paragraph 2 - PM2.5 concentration and vehicle fleet composition
 * SSE Message: data_emissions_paragraph2
 */
export const Paragraph2= () => {
  const paragraph2Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Data);
  const paragraphText = generateEmissionsParagraph2Text(paragraph2Data);

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
