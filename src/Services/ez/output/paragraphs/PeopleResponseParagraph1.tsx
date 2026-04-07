import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { SmartNumber, Sentence } from '../components';
import outputStyles from '../Output.module.less';

/**
 * People Response Paragraph - narrative behavioral response summary
 * SSE Message: data_text_paragraph1_people_response
 */
export const PeopleResponseParagraph1 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraphData);
  const componentState = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraphState);
  const error = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraphError);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_people_response');
    }
  };

  if (error) {
    return (
      <Alert
        message={t('paragraphs.peopleResponse1Error')}
        description={error}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('paragraphs.retry')}
          </Button>
        }
      />
    );
  }

  if (componentState === 'inactive' || componentState === 'loading' || !data) {
    return (
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="small" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';
  const affectedPct = data.totalTrips > 0 ? (data.affectedTrips / data.totalTrips) * 100 : 0;
  const unchangedPct = data.totalTrips > 0 ? (data.noChangeCount / data.totalTrips) * 100 : 0;

  if (data.affectedTrips === 0) {
    return (
      <div className={outputStyles.contentParagraph}>
        <p>
          {isFr
            ? 'La politique n\'a eu aucun impact comportemental. Les habitudes de deplacement de la population sont demeurees entierement inchangees.'
            : 'The policy had no behavioral impact. The population\'s travel patterns remained entirely unchanged.'}
        </p>
      </div>
    );
  }

  // Build the narrative response breakdown
  const responses: { label: string; count: number; pct: number }[] = [];
  if (data.modeShiftCount > 0) {
    responses.push({
      label: isFr ? 'ont change de mode de transport' : 'switched their mode of transport',
      count: data.modeShiftCount,
      pct: data.modeShiftPct,
    });
  }
  if (data.reroutedCount > 0) {
    responses.push({
      label: isFr ? 'ont choisi un itineraire alternatif' : 'chose an alternative route',
      count: data.reroutedCount,
      pct: data.reroutedPct,
    });
  }
  if (data.paidPenaltyCount > 0) {
    responses.push({
      label: isFr ? 'ont absorbe la charge de congestion' : 'absorbed the congestion charge',
      count: data.paidPenaltyCount,
      pct: data.paidPenaltyPct,
    });
  }
  if (data.cancelledCount > 0) {
    responses.push({
      label: isFr ? 'ont annule leur deplacement' : 'cancelled their trip',
      count: data.cancelledCount,
      pct: data.cancelledPct,
    });
  }

  if (isFr) {
    return (
      <div className={outputStyles.contentParagraph}>
        <p>
          <Sentence>
            La politique a affecte <SmartNumber value={data.affectedTrips} unitType="count" decimals={0} /> des
            <SmartNumber value={data.totalTrips} unitType="count" decimals={0} /> deplacements analyses
            (<SmartNumber value={affectedPct} unitType="percent" decimals={1} />),
            touchant <SmartNumber value={data.affectedAgents} unitType="count" decimals={0} /> voyageurs.
          </Sentence>
          {' '}
          {responses.map((r, i) => (
            <span key={i}>
              <Sentence>
                <SmartNumber value={r.count} unitType="count" decimals={0} /> deplacements
                (<SmartNumber value={r.pct} unitType="percent" decimals={1} />) {r.label}.
              </Sentence>
              {' '}
            </span>
          ))}
          {data.modeShiftCount === 0 && (
            <>
              <Sentence>
                Aucun voyageur n'a change de mode de transport.
              </Sentence>
              {' '}
            </>
          )}
          <Sentence>
            Les <SmartNumber value={data.noChangeCount} unitType="count" decimals={0} /> deplacements restants
            (<SmartNumber value={unchangedPct} unitType="percent" decimals={1} />)
            n'ont pas ete affectes par la politique.
          </Sentence>
          {data.paidPenaltyCount > 0 && data.penaltyCharges.length > 0 && (
            <>
              {' '}
              <Sentence>
                Le taux de congestion etait de
                <SmartNumber value={data.penaltyCharges[0].rate} unitType="currency" decimals={0} /> par passage.
              </Sentence>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={outputStyles.contentParagraph}>
      <p>
        <Sentence>
          The policy affected <SmartNumber value={data.affectedTrips} unitType="count" decimals={0} /> of the
          <SmartNumber value={data.totalTrips} unitType="count" decimals={0} /> trips analyzed
          (<SmartNumber value={affectedPct} unitType="percent" decimals={1} />),
          impacting <SmartNumber value={data.affectedAgents} unitType="count" decimals={0} /> travelers.
        </Sentence>
        {' '}
        {responses.map((r, i) => (
          <span key={i}>
            <Sentence>
              <SmartNumber value={r.count} unitType="count" decimals={0} /> trips
              (<SmartNumber value={r.pct} unitType="percent" decimals={1} />) {r.label}.
            </Sentence>
            {' '}
          </span>
        ))}
        {data.modeShiftCount === 0 && (
          <>
            <Sentence>
              No travelers changed their mode of transport.
            </Sentence>
            {' '}
          </>
        )}
        <Sentence>
          The remaining <SmartNumber value={data.noChangeCount} unitType="count" decimals={0} /> trips
          (<SmartNumber value={unchangedPct} unitType="percent" decimals={1} />)
          were unaffected by the policy.
        </Sentence>
        {data.paidPenaltyCount > 0 && data.penaltyCharges.length > 0 && (
          <>
            {' '}
            <Sentence>
              The congestion charge rate was
              <SmartNumber value={data.penaltyCharges[0].rate} unitType="currency" decimals={0} /> per passage.
            </Sentence>
          </>
        )}
      </p>
    </div>
  );
};
