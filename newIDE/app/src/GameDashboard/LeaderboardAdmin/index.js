// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import MUITextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Add from '@material-ui/icons/Add';
import Fingerprint from '@material-ui/icons/Fingerprint';
import Update from '@material-ui/icons/Update';
import Today from '@material-ui/icons/Today';
import Sort from '@material-ui/icons/Sort';
import SwapVertical from '@material-ui/icons/SwapVert';
import Refresh from '@material-ui/icons/Refresh';
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core';

import Copy from '../../UI/CustomSvgIcons/Copy';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { Column, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import PlaceholderError from '../../UI/PlaceholderError';
import RaisedButton from '../../UI/RaisedButton';
import TextField from '../../UI/TextField';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardProvider from '../../Leaderboard/LeaderboardProvider';
import Window from '../../Utils/Window';
import LeaderboardEntriesTable from './LeaderboardEntriesTable';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

const breakUuid = (uuid: string): string => `${uuid.split('-')[0]}-...`;

type Props = {| onLoading: boolean => void |};
type ContainerProps = {| ...Props, gameId: string |};

const styles = {
  leftColumn: { display: 'flex', flexDirection: 'column', flex: 1 },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 2,
  },
};

const LeaderboardAdmin = ({ onLoading }: Props) => {
  const isOnline = useOnlineStatus();
  const windowWidth = useResponsiveWindowWidth();
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [isRequestPending, setIsRequestPending] = React.useState<boolean>(
    false
  );
  const [newName, setNewName] = React.useState<string>('');

  const {
    leaderboards,
    listLeaderboards,
    currentLeaderboardId,
    createLeaderboard,
    selectLeaderboard,
    updateLeaderboard,
    resetLeaderboard,
    deleteLeaderboard,
    deleteLeaderboardEntry,
    displayOnlyBestEntry,
    setDisplayOnlyBestEntry,
    fetchLeaderboardEntries,
    browsing: { entries },
  } = React.useContext(LeaderboardContext);

  const _updateLeaderboard = async payload => {
    disableActions(true);
    await updateLeaderboard(payload);
    disableActions(false);
  };

  const _fetchLeaderboardEntries = async payload => {
    disableActions(true);
    await fetchLeaderboardEntries();
    disableActions(false);
  };

  const _resetLeaderboard = async (i18n: I18nType) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`All current entries will be deleted, are you sure you want to reset this leaderboard? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
    await resetLeaderboard();
    disableActions(false);
  };

  const _deleteLeaderboard = async (i18n: I18nType) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this leaderboard and all of its entries? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
    await deleteLeaderboard();
    disableActions(false);
  };

  const _deleteEntry = async (i18n: I18nType, entryId: string) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this entry? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
    await deleteLeaderboardEntry(entryId);
    disableActions(false);
  };

  const disableActions = (yesOrNo: boolean) => {
    setIsRequestPending(yesOrNo);
    onLoading(yesOrNo);
  };

  React.useEffect(
    () => {
      if (leaderboards === null) {
        setIsRequestPending(true);
        listLeaderboards().then(() => {
          setIsRequestPending(false);
        });
      }
    },
    [listLeaderboards, leaderboards]
  );
  const currentLeaderboard = React.useMemo(
    () => {
      if (!leaderboards || !currentLeaderboardId) return null;
      return leaderboards.filter(
        leaderboard => leaderboard.id === currentLeaderboardId
      )[0];
    },
    [leaderboards, currentLeaderboardId]
  );

  const onCopy = React.useCallback(
    () => {
      if (!currentLeaderboard) return;
      // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
      navigator.clipboard.writeText(currentLeaderboard.id);
    },
    [currentLeaderboard]
  );
  if (!isOnline)
    return (
      <PlaceholderError>
        <Trans>
          An internet connection is required to administrate your game's
          leaderboards.
        </Trans>
      </PlaceholderError>
    );
  if (leaderboards === null) {
    if (isRequestPending) return <PlaceholderLoader />;
    else
      return (
        <PlaceholderError onRetry={listLeaderboards}>
          <Trans>
            An error ocurred when retrieving leaderboards, please try again
            later.
          </Trans>
        </PlaceholderError>
      );
  }
  if (!!leaderboards && leaderboards.length === 0)
    return (
      <Line noMargin expand justifyContent="center">
        <EmptyPlaceholder
          title={<Trans>Create your game's first leaderboard</Trans>}
          description={<Trans>Leaderboards help retain your players</Trans>}
          actionLabel={<Trans>Create a leaderboard</Trans>}
          onAdd={() => {
            createLeaderboard({ name: 'New leaderboard', sort: 'ASC' });
          }}
        />
      </Line>
    );

  const leaderboardDescription = (
    i18n: I18nType,
    currentLeaderboard: Leaderboard
  ) => [
    {
      key: 'id',
      avatar: <Fingerprint />,
      text: (
        <Tooltip title={currentLeaderboard.id}>
          <Typography variant="body2">
            {breakUuid(currentLeaderboard.id)}
          </Typography>
        </Tooltip>
      ),
      secondaryAction: (
        <IconButton onClick={onCopy} tooltip={t`Copy`} edge="end">
          <Copy />
        </IconButton>
      ),
    },
    {
      key: 'startDatetime',
      avatar: <Today />,
      text: (
        <Tooltip
          title={i18n._(
            t`Date from which entries are taken into account: ${i18n.date(
              currentLeaderboard.startDatetime,
              {
                dateStyle: 'short',
                timeStyle: 'short',
              }
            )}`
          )}
        >
          <Typography variant="body2">
            {i18n.date(currentLeaderboard.startDatetime)}
          </Typography>
        </Tooltip>
      ),
      secondaryAction: (
        <IconButton
          onClick={() => _resetLeaderboard(i18n)}
          tooltip={t`Reset leaderboard`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <Update />
        </IconButton>
      ),
    },
    {
      key: 'sort',
      avatar: <Sort />,
      text: (
        <Typography variant="body2">
          {currentLeaderboard.sort === 'ASC' ? (
            <Trans>Lower is better</Trans>
          ) : (
            <Trans>Higher is better</Trans>
          )}
        </Typography>
      ),
      secondaryAction: (
        <IconButton
          onClick={async () => {
            await _updateLeaderboard({
              sort: currentLeaderboard.sort === 'ASC' ? 'DESC' : 'ASC',
            });
          }}
          tooltip={t`Change sort direction`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <SwapVertical />
        </IconButton>
      ),
    },
  ];
  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout noMargin expand>
          <div style={styles.leftColumn}>
            <Column>
              <Line>
                {isEditingName ? (
                  <TextField
                    fullWidth
                    value={newName}
                    onChange={(e, text) => setNewName(text)}
                    onKeyPress={event => {
                      if (event.key === 'Enter' && !isRequestPending) {
                        _updateLeaderboard({ name: newName }).then(() =>
                          setIsEditingName(false)
                        );
                      }
                    }}
                    disabled={isRequestPending}
                    floatingLabelText={<Trans>Leaderboard name</Trans>}
                  />
                ) : (
                  <Autocomplete
                    autoComplete
                    autoSelect
                    disableClearable
                    noOptionsText={<Trans>No matching leaderboard</Trans>}
                    style={{ flex: 1 }}
                    options={leaderboards}
                    getOptionLabel={option => option.name}
                    onChange={(e, leaderboard) => {
                      if (leaderboard) selectLeaderboard(leaderboard.id);
                    }}
                    getOptionSelected={(leaderboard, selectedId) => {
                      return leaderboard.id === selectedId;
                    }}
                    value={currentLeaderboard}
                    renderInput={params => (
                      <MUITextField
                        {...params}
                        margin="dense"
                        label={<Trans>Leaderboard name</Trans>}
                        variant="filled"
                      />
                    )}
                  />
                )}
                <IconButton
                  onClick={async () => {
                    const newLeaderboard = await createLeaderboard({
                      name: 'New leaderboard',
                      sort: 'ASC',
                    });
                    if (newLeaderboard) selectLeaderboard(newLeaderboard.id);
                  }}
                  disabled={isEditingName || isRequestPending}
                >
                  <Add />
                </IconButton>
              </Line>
              {currentLeaderboard ? (
                <>
                  {isEditingName ? (
                    <Line>
                      <>
                        <RaisedButton
                          label={<Trans>Cancel</Trans>}
                          onClick={async () => {
                            setIsEditingName(false);
                          }}
                          disabled={isRequestPending}
                        />
                        <Spacer />
                        <RaisedButton
                          primary
                          label={<Trans>Save</Trans>}
                          onClick={async () => {
                            await _updateLeaderboard({ name: newName });
                            setIsEditingName(false);
                          }}
                          disabled={isRequestPending}
                        />
                      </>
                    </Line>
                  ) : (
                    <Line justifyContent="space-between">
                      <RaisedButton
                        label={<Trans>Rename</Trans>}
                        disabled={isRequestPending}
                        onClick={async () => {
                          setNewName(currentLeaderboard.name);
                          setIsEditingName(true);
                        }}
                      />
                      <RaisedButton
                        label={<Trans>Delete</Trans>}
                        disabled={isRequestPending}
                        onClick={() => _deleteLeaderboard(i18n)}
                      />
                    </Line>
                  )}
                  <Spacer />
                  <List>
                    {leaderboardDescription(i18n, currentLeaderboard).map(
                      (item, index) => (
                        <>
                          {index > 0 ? (
                            <Divider
                              key={`divider-${item.key}`}
                              variant="inset"
                              component="li"
                            />
                          ) : null}
                          <ListItem key={item.key} disableGutters>
                            <ListItemAvatar>
                              <Avatar>{item.avatar}</Avatar>
                            </ListItemAvatar>
                            <ListItemText disableTypography>
                              {item.text}
                            </ListItemText>
                            <ListItemSecondaryAction>
                              {item.secondaryAction}
                            </ListItemSecondaryAction>
                          </ListItem>
                        </>
                      )
                    )}
                  </List>
                </>
              ) : null}
            </Column>
          </div>
          <div
            style={{
              ...styles.rightColumn,
              paddingLeft: windowWidth === 'small' ? 0 : 20,
            }}
          >
            <Line alignItems="center" justifyContent="flex-end">
              <Tooltip
                title={i18n._(
                  t`When checked, will only display the best score of each player`
                )}
              >
                <Typography variant="body2">
                  <Trans>Player best entry</Trans>
                </Typography>
              </Tooltip>
              <Switch
                size="small"
                checked={displayOnlyBestEntry}
                onClick={() => setDisplayOnlyBestEntry(!displayOnlyBestEntry)}
              />
              <Divider orientation="vertical" />
              <Tooltip title={i18n._(t`Refresh`)}>
                <IconButton
                  onClick={_fetchLeaderboardEntries}
                  disabled={isRequestPending || isEditingName}
                  size="small"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Line>
            <LeaderboardEntriesTable
              entries={entries}
              onDeleteEntry={entryId => _deleteEntry(i18n, entryId)}
            />
          </div>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

const LeaderboardAdminContainer = ({
  gameId,
  ...otherProps
}: ContainerProps) => (
  <LeaderboardProvider gameId={gameId}>
    <LeaderboardAdmin {...otherProps} />
  </LeaderboardProvider>
);

export default LeaderboardAdminContainer;