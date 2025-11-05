import { useState, useEffect } from 'react'

import { useEZSessionStore } from '~stores/session'
import { useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'

import { Button, Input } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;

export const ParameterSelectionView = () => {
  const setState = useEZServiceStore((state) => state.setState)
  const scenarioTitle = useEZSessionStore((state) => state.scenarioTitle)
  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle)

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenarioTitle);

  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

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
