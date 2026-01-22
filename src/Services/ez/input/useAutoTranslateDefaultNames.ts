import { useEffect } from 'react';
import i18n from '~i18nConfig';
import { useEZSessionStore } from '~stores/session';
import { detectDefaultNameType, convertDefaultName } from '~utils/zoneNames';

/**
 * Hook that automatically translates default zone and custom area names
 * when the language changes. Only translates names that match default patterns
 * (e.g., "New Zone 1", "Nouvelle zone 2", "Custom Area 1").
 *
 * Custom user-edited names are preserved.
 */
export const useAutoTranslateDefaultNames = () => {
  useEffect(() => {
    const translateAllDefaultNames = (lng: string) => {
      const targetLang = lng as 'en' | 'fr';

      // Translate scenario title
      const scenarioTitle = useEZSessionStore.getState().scenarioTitle;
      const setScenarioTitle = useEZSessionStore.getState().setScenarioTitle;
      const detectedScenario = detectDefaultNameType(scenarioTitle);

      if (detectedScenario.type === 'scenario') {
        const translatedTitle = convertDefaultName(scenarioTitle, targetLang);
        if (translatedTitle !== scenarioTitle) {
          setScenarioTitle(translatedTitle);
        }
      }

      // Translate zone names
      const sessionZones = useEZSessionStore.getState().zones;
      const setZoneProperty = useEZSessionStore.getState().setZoneProperty;

      Object.entries(sessionZones).forEach(([zoneId, zoneData]) => {
        const detected = detectDefaultNameType(zoneData.name);

        // Only translate if it's a default name pattern
        if (detected.type === 'zone') {
          const translatedName = convertDefaultName(zoneData.name, targetLang);
          if (translatedName !== zoneData.name) {
            setZoneProperty(zoneId, 'name', translatedName);
          }
        }
      });

      // Translate custom area names
      const sessionCustomAreas = useEZSessionStore.getState().customAreas;
      const setCustomAreaProperty = useEZSessionStore.getState().setCustomAreaProperty;

      Object.entries(sessionCustomAreas).forEach(([areaId, areaData]) => {
        const detected = detectDefaultNameType(areaData.name);

        // Only translate if it's a default name pattern
        if (detected.type === 'customArea') {
          const translatedName = convertDefaultName(areaData.name, targetLang);
          if (translatedName !== areaData.name) {
            setCustomAreaProperty(areaId, 'name', translatedName);
          }
        }
      });

      console.log('[AutoTranslate] Default names translated to:', targetLang);
    };

    // Run translation on mount to handle existing default names
    translateAllDefaultNames(i18n.language);

    // Listen to language changes
    i18n.on('languageChanged', translateAllDefaultNames);

    // Cleanup
    return () => {
      i18n.off('languageChanged', translateAllDefaultNames);
    };
  }, []);
};
