import { useState, useEffect } from 'react'

import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest } from '~ez/api/apiRequestFactory'

import { startSimulation } from '~ez/api/startSimulation'
import { useNotificationStore } from '~/Services/CustomNotification'
import { hasOutputData } from '~stores/output'

import { Button, Input, Modal } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;

export const ParameterSelectionView = () => {
  const [modal, contextHolder] = Modal.useModal();
  const setState = useEZServiceStore((state) => state.setState)
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive)
  const scenarioTitle = useEZSessionStore((state) => state.scenarioTitle)
  const scenarioDescription = useEZSessionStore((state) => state.scenarioDescription)
  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle)
  const setIsNewSimulation = useEZSessionStore((state) => state.setIsNewSimulation)

  const apiPayload = useAPIPayloadStore(state => state.payload)

  const setNotification = useNotificationStore((state) => state.setNotification)

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenarioTitle);

  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

  const handleStartSimulation = () => {
    const apiRequest = createAPIRequest(apiPayload, scenarioTitle, scenarioDescription);
    const validation = validateAPIRequest(apiRequest);

    if (!validation.isValid) {
      setNotification(validation.error, 'error');
      return;
    }

    const outputExists = hasOutputData();

    if (isEzBackendAlive) {
      if (outputExists) {
        const instance = modal.confirm({
          title: 'Previous Results Found',
          icon: <ExclamationCircleOutlined />,
          content: 'You have previous simulation results. Do you want to return to them or start a new simulation?',
          okText: 'Start New Simulation',
          cancelText: 'Cancel',
          onOk() {
            setIsNewSimulation(true);
            setState('AWAIT_RESULTS');
            startSimulation(setState);
          },
          footer: (_, { OkBtn, CancelBtn }) => (
            <>
              <CancelBtn />
              <Button
                type="primary"
                onClick={() => {
                  setState('RESULT_VIEW');
                  instance.destroy();
                }}
              >
                Return to Output
              </Button>
              <OkBtn />
            </>
          ),
        });
      } else {
        setIsNewSimulation(true);
        setState('AWAIT_RESULTS');
        startSimulation(setState);
      }
    } else {
      if (outputExists) {
        setState('RESULT_VIEW');
      } else {
        setIsNewSimulation(true);
        setState('AWAIT_RESULTS');
        startSimulation(setState);
      }
    }
  }

  return (
    <>
      {contextHolder}
      <div className={styles.backButtonContainer}>
          <Button type="link" onClick={() => setState('WELCOME')} className={styles.backButton}>
            <ArrowLeftOutlined style={{fontSize: '12px'}} />
            Back to Welcome page
          </Button>
        </div>
        <div className={styles.scenarioTitleContainer}>
          {isEditingTitle ? (
            <>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                className={styles.scenarioTitleInput}
                autoFocus
                onPressEnter={() => {
                  setScenarioTitle(editedTitle.slice(0, MAX_NAME_LENGTH));
                  setIsEditingTitle(false);
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => {
                  setScenarioTitle(editedTitle.slice(0, MAX_NAME_LENGTH));
                  setIsEditingTitle(false);
                }}
              />
            </>
          ) : (
            <>
              <div className={styles.scenarioTitleDisplay}>
                <h4>{scenarioTitle || 'New Scenario'}</h4>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined className={styles.editIcon} />}
                  onClick={() => setIsEditingTitle(true)}
                />
              </div>
            </>
          )}
        </div>
      <InputContainer />
      <div className={styles.buttonContainer}>
        <Button
          type="primary"
          onClick={handleStartSimulation}
          className={styles.simulationButton}
        >
          <div className={styles.buttonText}>
            <SendOutlined />
            <span>Start Simulation</span>
          </div>
        </Button>
      </div>
    </>
  )
}
