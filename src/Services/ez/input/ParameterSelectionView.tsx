import { useState, useEffect } from 'react'

import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest } from '../api/apiRequestFactory'

import { startSimulation } from '../api/startSimulation'
import { useNotificationStore } from '~/Services/CustomNotification'

import { Button, Input } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;

export const ParameterSelectionView = () => {
  const setState = useEZServiceStore((state) => state.setState)
  const scenarioTitle = useEZSessionStore((state) => state.scenarioTitle)
  const scenarioDescription = useEZSessionStore((state) => state.scenarioDescription)
  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle)

  const apiPayload = useAPIPayloadStore(state => state.payload)

  const setNotification = useNotificationStore((state) => state.setNotification)

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenarioTitle);

  // Sync editedTitle with scenarioTitle when scenarioTitle changes externally
  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

  const handleStartSimulation = () => {
    // Create API request from payload
    const apiRequest = createAPIRequest(
      apiPayload,
      scenarioTitle,
      scenarioDescription
    );

    // Validate the request
    const validation = validateAPIRequest(apiRequest);
    if (!validation.isValid) {
      setNotification(validation.error, 'error');
      return;
    }

    // Validation passed - change state and start simulation
    setState('WAITING_FOR_RESULT');
    startSimulation(setState);
  }

  return (
    <>
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
