import { useServiceStore } from '~globalStores';
import ZeleIA from './Zele';
import { EzService } from './ez';

export default function Services() {
  const activeService = useServiceStore((state) => state.activeService);

  return (
    <>
      {activeService === "ZELE" && <ZeleIA />}
      {activeService === "EZ" && <EzService />}
    </>
  );
}
