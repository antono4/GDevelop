// @flow
import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { TutorialsList } from '../../../Tutorial/TutorialsList';
import Window from '../../../Utils/Window';
import { Trans } from '@lingui/macro';
import PublishIcon from '@material-ui/icons/Publish';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import { type HomeTab } from './HomePageMenu';
import { isUserflowRunning } from '../../Onboarding/OnboardingDialog';
import { isMobile } from '../../../Utils/Platform';
import optionalRequire from '../../../Utils/OptionalRequire';
import { sendOnboardingManuallyOpened } from '../../../Utils/Analytics/EventSender';
import { SectionContainer } from './SectionContainer';
import FlatButton from '../../../UI/FlatButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, SMALL_WIDGET_SIZE } from './CardWidget';
import { GridList, GridListTile } from '@material-ui/core';
const electron = optionalRequire('electron');

const styles = {
  grid: {
    marginBottom: 50,
    textAlign: 'center',
    maxWidth: SMALL_WIDGET_SIZE * 4 + 100, // Avoid tiles taking too much space on large screens.
  },
  gridListTile: { display: 'flex', justifyContent: 'center' },
  helpItem: {
    padding: 10,
  },
  tutorialsContainer: {
    marginTop: 30,
  },
};

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 4;
  }
};

type Props = {|
  onOpenOnboardingDialog: () => void,
  onOpenExamples: () => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenHelpFinder: () => void,
|};

export const LearnSection = ({
  onOpenOnboardingDialog,
  onOpenExamples,
  onTabChange,
  onOpenHelpFinder,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const helpItems = [
    !electron && !isMobile() && !isUserflowRunning
      ? {
          title: <Trans>Guided Tour</Trans>,
          description: (
            <Trans>Learn the fundamentals of the editor in 5 minutes</Trans>
          ),
          action: () => {
            sendOnboardingManuallyOpened();
            onOpenOnboardingDialog();
          },
        }
      : undefined,
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: onOpenHelpFinder,
    },
    {
      title: <Trans>Examples</Trans>,
      description: (
        <Trans>Have a look from the inside at existing projects</Trans>
      ),
      action: onOpenExamples,
    },
    {
      title: <Trans>Community</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => onTabChange('community'),
    },
  ].filter(Boolean);

  return (
    <SectionContainer title={<Trans>Help and guides</Trans>}>
      <Line noMargin>
        <Text size="sub-title">
          <Trans>Shortcuts</Trans>
        </Text>
      </Line>
      <Line noMargin>
        <GridList
          cols={getColumnsFromWidth(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={10}
        >
          {helpItems.map((helpItem, index) => (
            <GridListTile key={index} style={styles.gridListTile}>
              <CardWidget onClick={helpItem.action} key={index}>
                <div style={styles.helpItem}>
                  <Column alignItems="center">
                    <Text size="block-title">{helpItem.title}</Text>
                    <Text size="body" color="secondary">
                      {helpItem.description}
                    </Text>
                  </Column>
                </div>
              </CardWidget>
            </GridListTile>
          ))}
        </GridList>
      </Line>
      <LineStackLayout
        justifyContent="space-between"
        alignItems="center"
        noMargin
        expand
      >
        <Column noMargin>
          <Text size="title">
            <Trans>Guides and tutorials</Trans>
          </Text>
        </Column>
        <Column noMargin>
          {windowWidth === 'large' && (
            <FlatButton
              key="submit-example"
              onClick={() => {
                Window.openExternalURL(
                  'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                );
              }}
              primary
              icon={<PublishIcon />}
              label={<Trans>Submit your project as an example</Trans>}
            />
          )}
        </Column>
      </LineStackLayout>
      <Line noMargin>
        <Text size="sub-title" noMargin>
          <Trans>Learn by doing</Trans>
        </Text>
      </Line>
      <div style={styles.tutorialsContainer}>
        <ResponsiveLineStackLayout expand noMargin>
          <TutorialsList />
        </ResponsiveLineStackLayout>
      </div>
    </SectionContainer>
  );
};