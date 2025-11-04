import { Menu, Button } from "antd";
import { useServiceStore } from '~globalStores';
import { checkBackendHealth } from '../Services/ez/api/healthCheck';
import { useNotificationStore } from '../Services/CustomNotification';
import ZeleHeader from '../Services/Zele/zeleHeader';
import EzHeader from '../Services/ez/header';

export default function HeaderContent() {

  const serviceState = useServiceStore((state) => state.activeService);
  const setActiveService = useServiceStore((state) => state.setActiveService);
  const setNotification = useNotificationStore((state) => state.setNotification);

  const handleEzClick = () => {
    
    setActiveService("EZ");

    if (process.env.REACT_APP_EZ_BACKEND_URL) {
      const healthEndpoint = `${process.env.REACT_APP_EZ_BACKEND_URL}/alive`;

      checkBackendHealth(healthEndpoint).then((isAlive) => {
        if (!isAlive) {
          setNotification(
            'Backend connection failed. Switched to DEMO MODE.',
            'warning'
          );
        }
      });
    }
  };

  const menuItems = [
    { key: 'layers', label: 'Layers' },
    {
      key: 'services',
      label: 'Services',
      children: [
        { label: 'Building Info', key: 'bldg-info' },
        { label: 'IDF Generator', key: 'IDF-Generator' },
        { label: 'Single-Building Retrofit', key: 'Single-Building-Retrofit' },
        { label: 'Multi-Building Retrofit', key: 'Multi-Building-Retrofit' },
        { label: 'ZELE Impact analysis', key: 'ZELE', onClick: () => { setActiveService("ZELE") } },
        { label: 'EZ', key: 'EZ', onClick: handleEzClick }
      ]
    },
    { key: 'workbench', label: 'Workbench' }
  ];

  return (
    <>
      {serviceState === "REST" && (
        <>
          <Menu mode="horizontal" items={menuItems} className="headerMenu" />
          <Button className="headerButton">En</Button>
        </>
      )}
      {serviceState === "ZELE" && (<ZeleHeader />)}
      {serviceState === "EZ" && (<EzHeader />)}
    </>
  );
}
